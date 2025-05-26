<script setup>
import DslLiveValidator from "@/components/DslLiveValidator.vue";
import { ref, onMounted } from "vue";

const editorContainer = ref(null);
const status = ref("");
let editor;

function insertExample() {
    const example = {
        version: 1,
        blocks: {
            src_web: {
                type: "source",
                pass_to: "weekday_filter"
            },
            weekday_filter: {
                type: "time_gate",
                from: "src_web",
                schedule_if_off: {
                    cron: "0 9 * * 1-5"
                },
                pass_to: "group_router"
            },
            group_router: {
                type: "router",
                from: "weekday_filter",
                pass_to: "groupA"
            },
            groupA: {
                type: "receiver",
                from: "group_router",
                members: ["alice", "bob", "carol"],
                weights: {
                    alice: 0.5,
                    bob: 0.3,
                    carol: 0.2
                }
            }
        }
    };
    editor.setValue(JSON.stringify(example, null, 2));
}

async function uploadDsl() {
    try {
        const payload = JSON.parse(editor.getValue());
        const res = await fetch("/api/dsl/load", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload, null, 2)
        });
        const text = await res.text();
        status.value = `✅ ${res.status} ${text}`;
    } catch (err) {
        status.value = `❌ Upload failed: ${err.message}`;
    }
}

onMounted(() => {
    const loaderScript = document.createElement("script");
    loaderScript.src = "https://unpkg.com/monaco-editor@0.45.0/min/vs/loader.js";
    loaderScript.onload = () => {
        window.require.config({ paths: { vs: "https://unpkg.com/monaco-editor@0.45.0/min/vs" } });
        window.MonacoEnvironment = {
            getWorkerUrl: function (_, label) {
                return `data:text/javascript;charset=utf-8,` + encodeURIComponent(`
          self.MonacoEnvironment = { baseUrl: 'https://unpkg.com/monaco-editor@0.45.0/min/' };
          importScripts('https://unpkg.com/monaco-editor@0.45.0/min/vs/base/worker/workerMain.js');
        `);
            }
        };

        window.require(["vs/editor/editor.main"], () => {
            editor = monaco.editor.create(editorContainer.value, {
                value: "{}",
                language: "json",
                theme: "vs-dark",
                automaticLayout: true
            });
            insertExample();
        });
    };
    document.body.appendChild(loaderScript);
});
</script>

<template>
    <div class="p-4 h-full">
        <DslLiveValidator />
    </div>
</template>

<style scoped>
html, body, #app {
    height: 100%;
    margin: 0;
}
</style>
