"use client";

import { useEffect, useRef, useCallback } from "react";

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos en ms

const ACTIVITY_EVENTS = [
    "mousedown",
    "mousemove",
    "keydown",
    "touchstart",
    "scroll",
    "click",
];

/**
 * Hook que detecta inactividad del usuario y dispara un callback.
 * @param {Function} onInactive - Se llama cuando el usuario está inactivo
 * @param {number} timeout - Milisegundos de inactividad (default: 15 min)
 */
export function useInactivity(onInactive, timeout = INACTIVITY_TIMEOUT) {
    const timerRef = useRef(null);
    const onInactiveRef = useRef(onInactive);

    // Actualizar la ref cuando cambia el callback
    useEffect(() => {
        onInactiveRef.current = onInactive;
    }, [onInactive]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            onInactiveRef.current?.();
        }, timeout);
    }, [timeout]);

    useEffect(() => {
        // Iniciar el timer al montar
        resetTimer();

        // Agregar event listeners de actividad
        ACTIVITY_EVENTS.forEach((event) => {
            window.addEventListener(event, resetTimer, { passive: true });
        });

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            ACTIVITY_EVENTS.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [resetTimer]);
}
