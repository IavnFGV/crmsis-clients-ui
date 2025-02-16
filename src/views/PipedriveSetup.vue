<script setup>
import { ref } from 'vue';

const name = ref('');
const httpAddress = ref('');
const token = ref('');

function saveConfig() {
    console.log({ name: name.value, httpAddress: httpAddress.value, token: token.value });
}
</script>

<template>
    <div>
        <h3>Pipedrive Setup</h3>
        <input v-model='name' placeholder='Name' />
        <input v-model='httpAddress' placeholder='HTTP Address' />
        <input v-model='token' placeholder='Token' />
        <button @click='saveConfig'>Save</button>
    </div>
</template>
