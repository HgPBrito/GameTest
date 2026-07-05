// script.js — inicialização apenas.
// Toda a lógica do aplicativo vive nos módulos dentro de js/ (app.js é o
// orquestrador principal). Este arquivo existe só para dar o start.
import { MemoryApp } from './js/app.js';

document.addEventListener('DOMContentLoaded', () => {
    window.memoryApp = new MemoryApp();
});
