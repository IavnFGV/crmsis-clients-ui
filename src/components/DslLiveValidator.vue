<template>
    <div class="h-screen grid grid-cols-2 gap-4 p-4">
        <div class="flex flex-col">
            <div class="font-semibold mb-1 flex justify-between items-center">
                <span>DSL Input</span>
                <button @click="insertDsl" class="text-xs bg-green-600 text-white px-2 py-1 rounded">
                    Insert Example DSL
                </button>
            </div>
            <div ref="dslContainer" class="flex-1 border rounded"></div>
        </div>
        <div class="flex flex-col">
            <div class="font-semibold mb-1 flex justify-between items-center">
                <span>JSON Schema</span>
            </div>
            <div ref="schemaContainer" class="flex-1 border rounded"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const dslContainer = ref(null);
const schemaContainer = ref(null);

let dslEditor, schemaEditor, validateFn;
let monacoInitialized = false;

const schemaObject = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["version", "blocks"],
    "properties": {
        "version": { "type": "integer" },
        "blocks": {
            "type": "object",
            "additionalProperties": {
                "type": "object",
                "required": ["type"],
                "properties": {
                    "type": { "type": "string" },
                    "from": { "type": "string" },
                    "pass_to": { "type": "string" },
                    "members": {
                        "type": "array",
                        "items": { "type": "string" }
                    },
                    "weights": {
                        "type": "object",
                        "additionalProperties": { "type": "number" }
                    },
                    "schedule_if_off": {
                        "type": "object",
                        "properties": {
                            "cron": { "type": "string" }
                        }
                    }
                }
            }
        }
    }
};

function insertDsl() {
    if (!dslEditor) return;
    const exampleDsl = {
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
    dslEditor.setValue(JSON.stringify(exampleDsl, null, 2));
}

function showValidationErrors(errors) {
    const markers = (errors || []).map(err => ({
        severity: monaco.MarkerSeverity.Error,
        message: err.message,
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1
    }));
    monaco.editor.setModelMarkers(dslEditor.getModel(), "dsl", markers);
}

function validateDsl() {
    if (!validateFn || !dslEditor) return;
    try {
        const data = JSON.parse(dslEditor.getValue());
        const valid = validateFn(data);
        if (!valid) {
            showValidationErrors(validateFn.errors);
        } else {
            monaco.editor.setModelMarkers(dslEditor.getModel(), "dsl", []);
        }
    } catch (e) {
        showValidationErrors([{ message: "JSON Parse Error: " + e.message }]);
    }
}

function setupMonaco() {
    if (monacoInitialized) return;
    monacoInitialized = true;

    window.require(["vs/editor/editor.main"], async () => {
        dslEditor = monaco.editor.create(dslContainer.value, {
            value: "{}",
            language: "json",
            theme: "vs",
            automaticLayout: true
        });

        schemaEditor = monaco.editor.create(schemaContainer.value, {
            value: JSON.stringify(schemaObject, null, 2),
            language: "json",
            theme: "vs",
            readOnly: true,
            automaticLayout: true
        });

        const ajvModule = await import("ajv");
        const Ajv = ajvModule.default || ajvModule;
        const ajvInstance = new Ajv();
        validateFn = ajvInstance.compile(schemaObject);

        insertDsl();
        validateDsl();

        dslEditor.onDidChangeModelContent(() => {
            validateDsl();
        });
    });
}

onMounted(() => {
    if (window.require) {
        setupMonaco();
    } else {
        const loader = document.createElement("script");
        loader.src = "https://unpkg.com/monaco-editor@0.45.0/min/vs/loader.js";
        loader.onload = () => {
            window.require.config({ paths: { vs: "https://unpkg.com/monaco-editor@0.45.0/min/vs" } });
            window.MonacoEnvironment = {
                getWorkerUrl(_, label) {
                    return `data:text/javascript;charset=utf-8,` + encodeURIComponent(`
            self.MonacoEnvironment = { baseUrl: 'https://unpkg.com/monaco-editor@0.45.0/min/' };
            importScripts('https://unpkg.com/monaco-editor@0.45.0/min/vs/base/worker/workerMain.js');
          `);
                }
            };
            setupMonaco();
        };
        document.body.appendChild(loader);
    }
});
</script>

<style scoped>
html,
body {
    margin: 0;
    height: 100%;
    width: 100%;
}
</style>
