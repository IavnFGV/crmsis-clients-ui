import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
import Login from "@/views/Login.vue";
import PipedriveSetup from "@/views/PipedriveSetup.vue";
import Definitions from "@/views/Definitions.vue";
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: 'pipedrive',
                    component: PipedriveSetup,
                },
                {
                    path: 'definitions',
                    component: Definitions
                }
            ],
            beforeEnter: (to, from, next) => {
                const authStore = useAuthStore();
                if (!authStore.isAuthenticated) next('/login');
                else next();
            }
        },
        {
            path: '/login',
            component: Login
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

    ]
});

export default router;
