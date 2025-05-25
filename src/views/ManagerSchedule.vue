<script setup>
import {ref, computed, onMounted} from "vue";
import axios from "axios";

const API_BASE = "/api/v1/workweek";

const managers = ref([]);
const allUsers = ref([]);
const originalMap = new Map(); // managerId → configJson

const filter = ref("");

const filteredManagers = computed(() =>
    managers.value.filter((m) =>
        m.name.toLowerCase().includes(filter.value.toLowerCase()) ||
        m.email.toLowerCase().includes(filter.value.toLowerCase())
    )
);

function addManager() {
    const newId = Math.random().toString(36).slice(2);
    const newManager = {
        id: newId,
        name: "",
        email: "",
        role: "user",
        workHours: "00:00 — 00:00",
        workDays: [false, false, false, false, false, false, false],
        salesPlan: 0,
        callPlan: 0,
        minutesPlan: 0,
    };
    managers.value.push(newManager);
    originalMap.set(newId, JSON.stringify(newManager)); // для возможности отката
}

function removeManager(index) {
    const removed = managers.value.splice(index, 1)[0];
    originalMap.delete(removed.id);
}

async function submit() {
    const changed = [];

    for (const m of managers.value) {
        const current = {
            name: m.name,
            email: m.email,
            role: m.role,
            workHours: m.workHours,
            workDays: m.workDays,
            salesPlan: m.salesPlan,
            callPlan: m.callPlan,
            minutesPlan: m.minutesPlan,
        };

        const currentJson = JSON.stringify(current);
        if (originalMap.get(m.id) !== currentJson) {
            changed.push({
                managerId: m.id,
                type: "individual",
                configJson: currentJson,
            });
        }
    }

    try {
        for (const item of changed) {
            await axios.post(API_BASE, item);
            originalMap.set(item.managerId, item.configJson); // обновляем сохранённую версию
        }

        alert(`Сохранено ${changed.length} изменений`);
    } catch (e) {
        console.error("Ошибка при сохранении:", e);
        alert("Ошибка при сохранении");
    }
}

async function loadAll() {
    try {
        const res = await axios.get(API_BASE);
        const list = res.data;

        managers.value = list.map((item) => {
            const config = JSON.parse(item.configJson);
            const m = {
                id: item.managerId,
                name: config.name ?? "",
                email: config.email ?? "",
                role: config.role ?? "user",
                workHours: config.workHours ?? "00:00 — 00:00",
                workDays: config.workDays ?? [false, false, false, false, false, false, false],
                salesPlan: config.salesPlan ?? 0,
                callPlan: config.callPlan ?? 0,
                minutesPlan: config.minutesPlan ?? 0,
            };
            originalMap.set(m.id, JSON.stringify(m));
            return m;
        });
    } catch (e) {
        console.error("Ошибка при загрузке workweek:", e);
        alert("Ошибка при загрузке данных");
    }
}

async function loadUsers() {
    try {
        const res = await axios.get(API_BASE + '/users');
        allUsers.value = res.data;
    } catch (e) {
        console.error("Ошибка при загрузке пользователей:", e);
        alert("Ошибка при загрузке пользователей");
    }
}

function onManagerSelected(entry) {
    const selectedUser = allUsers.value.find(u => u.email === entry.email);
    if (selectedUser) {
        entry.name = selectedUser.name;
        entry.id = selectedUser.id.toString(); // или idPipedrive, если нужно
    }
}


onMounted(async () => {
    await Promise.all([
        loadAll(),
        loadUsers()
    ]);
});

</script>
<template>
    <div class="p-4 space-y-4">
        <div class="flex justify-between items-center">
            <input v-model="filter" placeholder="Manager" class="border p-1 rounded"/>
            <button @click="addManager" class="ml-2 px-3 py-1 bg-blue-600 text-white rounded">+ Add</button>
        </div>
        <div
            class="grid items-end gap-2 grid-cols-[2fr_1fr_2fr_repeat(7,2rem)_1fr_1fr_1fr_auto] font-semibold text-gray-600 px-2">
            <div>Manager</div>
            <div>Role</div>
            <div>Work hours</div>
            <!-- Days row (empty on top) + short names -->
            <div class="col-span-7 text-center">
                <div class="text-sm mb-1">Work days</div>
                <div class="grid grid-cols-7 gap-1">
      <span v-for="(d, i) in ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']"
            :key="i"
            class="text-center text-xs text-gray-500">
        {{ d }}
      </span>
                </div>
            </div>
            <div>Sales plan</div>
            <div>Call plan</div>
            <div>Minutes plan</div>
            <div class="w-8"></div> <!-- Пустая ячейка под корзину -->
        </div>
        <div
            v-for="(entry, index) in filteredManagers"
            :key="entry.id"
            class="grid items-center gap-2 grid-cols-[2fr_1fr_2fr_repeat(7,2rem)_1fr_1fr_1fr_auto] bg-gray-100 p-2 rounded"
        >
            <!-- Manager select -->
            <div>
                <select
                    v-model="entry.email"
                    @change="onManagerSelected(entry)"
                    class="w-full border rounded px-1"
                >
                    <option value="" disabled>Choose email</option>
                    <option
                        v-for="user in allUsers"
                        :key="user.id"
                        :value="user.email"
                    >
                        {{ user.email }}
                    </option>
                </select>
                <p class="text-sm text-gray-500 italic">{{ entry.name }}</p>
            </div>

            <!-- Role -->
            <div>
                <select v-model="entry.role" class="w-full border rounded px-1">
                    <option value="owner">Owner</option>
                    <option value="manager">Manager</option>
                    <option value="user">User</option>
                </select>
            </div>

            <!-- Work hours -->
            <div>
                <input type="text" v-model="entry.workHours" class="w-full border rounded px-1"/>
            </div>

            <!-- Work days checkboxes -->
            <div v-for="(day, i) in 7" :key="i">
                <input type="checkbox" v-model="entry.workDays[i]" class="mx-auto block h-4 w-4"/>
            </div>

            <!-- Sales / Call / Minutes plan -->
            <div>
                <input type="number" v-model.number="entry.salesPlan" class="w-full border rounded px-1"/>
            </div>
            <div>
                <input type="number" v-model.number="entry.callPlan" class="w-full border rounded px-1"/>
            </div>
            <div>
                <input type="number" v-model.number="entry.minutesPlan" class="w-full border rounded px-1"/>
            </div>

            <!-- Remove icon -->
            <div class="w-8 text-center">
                <button
                    @click="removeManager(index)"
                    class="p-1 text-red-600 hover:text-red-800"
                    aria-label="Remove"
                >
                    <span class="pi pi-trash text-lg"/>
                </button>
            </div>
        </div>


        <div class="text-right pt-4">
            <button @click="submit" class="px-4 py-2 bg-green-600 text-white rounded">Save Configuration</button>
        </div>
    </div>
</template>
