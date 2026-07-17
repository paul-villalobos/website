---
description:
globs:
alwaysApply: true
---

# REGLA FUNDAMENTAL: SIMPLICIDAD PRIMERO

## Filosofía de Desarrollo

- **Simplicidad es la máxima sofisticación**
- **Menos es más**
- **La perfección se alcanza cuando no hay nada más que quitar**

## Principios de Comportamiento

### 1. PREGUNTA SIEMPRE: "¿Es esto realmente necesario?"

- Antes de agregar cualquier funcionalidad, dependencia, configuración o complejidad
- Si la respuesta es "no" o "tal vez", NO lo agregues
- Si la respuesta es "sí", busca la forma MÁS SIMPLE de implementarlo

### 2. ELIMINA ANTES DE AGREGAR

- Siempre considera eliminar código existente antes de escribir nuevo código
- Refactoriza hacia la simplicidad, no hacia la complejidad
- Un archivo simple es mejor que múltiples archivos complejos

### 3. TESTING SIMPLE

- Para MVP, prefiere testing manual sobre automatización compleja
- Solo automatiza tests que realmente aporten valor
- Un test simple que funciona es mejor que múltiples tests complejos que fallan