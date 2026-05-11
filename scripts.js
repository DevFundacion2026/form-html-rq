document.addEventListener('DOMContentLoaded', () => {
    const form = {
        sheetUrl: document.getElementById('sheetUrl'),
        sheetName: document.getElementById('sheetName'),
        emailFinanzas: document.getElementById('emailFinanzas'),
        mensaje: document.getElementById('mensaje'),
        tipoEnvio: document.getElementById('tipoEnvio'),
        lineas: document.getElementById('lineas'),
        btnEnviar: document.getElementById('btnEnviar'),
        contador: document.getElementById('contador'),
        charCountDiv: document.querySelector('.char-count'),
        status: document.getElementById('status'),
        spinner: document.getElementById('spinner'),
        btnText: document.getElementById('btnText'),
        priorityOptions: document.querySelectorAll('.priority-option')
    };

    // --- Char Counter Logic ---
    form.mensaje.addEventListener('input', () => {
        const length = form.mensaje.value.length;
        form.contador.textContent = length;

        // Visual feedback for character limit
        if (length > 450) {
            form.charCountDiv.className = 'char-count danger';
        } else if (length > 400) {
            form.charCountDiv.className = 'char-count warning';
        } else {
            form.charCountDiv.className = 'char-count';
        }
    });

    // --- Priority Selection Logic ---
    form.priorityOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all
            form.priorityOptions.forEach(opt => opt.classList.remove('active'));

            // Add to clicked
            option.classList.add('active');

            // Check the hidden radio
            const radio = option.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });
    });

    // --- Helper: Show Status ---
    const showStatus = (msg, type) => {
        form.status.textContent = msg;
        form.status.className = `status ${type}`;
        form.status.style.display = 'block';

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                form.status.style.opacity = '0';
                setTimeout(() => {
                    form.status.style.display = 'none';
                    form.status.style.opacity = '1';
                }, 500);
            }, 5000);
        }
    };

    // --- Validation Logic ---
    const validateForm = () => {
        if (!form.sheetUrl.value.trim() || !form.sheetUrl.value.includes('docs.google.com/spreadsheets')) {
            showStatus('❌ Ingresa una URL válida de Google Sheets', 'error');
            return false;
        }
        if (!form.emailFinanzas.checkValidity()) {
            showStatus('❌ Ingresa un correo electrónico válido', 'error');
            return false;
        }
        if (form.mensaje.value.trim().length < 20) {
            showStatus('❌ El mensaje debe tener al menos 20 caracteres', 'error');
            return false;
        }
        return true;
    };

    // --- Submit Logic ---
    const enviarRQ = async () => {
        if (!validateForm()) return;

        // UI State: Loading
        form.btnEnviar.disabled = true;
        form.spinner.style.display = 'block';
        form.btnText.textContent = 'Enviando...';
        form.status.style.display = 'none';

        const selectedPriority = document.querySelector('input[name="prioridad"]:checked').value;

        const data = {
            sheet_url: form.sheetUrl.value.trim(),
            sheet_name: form.sheetName.value.trim(),
            email_finanzas: form.emailFinanzas.value.trim(),
            mensaje: form.mensaje.value.trim(),
            prioridad: selectedPriority,
            tipo_envio: form.tipoEnvio.value,
            lineas_presupuestales: form.lineas.value.trim()
        };

        try {
            const response = await fetch('https://n8n.avanzarsocial.com/webhook/enviar-rq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Error en el servidor');

            const result = await response.json();

            if (result.success) {
                showStatus('✅ ¡Requerimiento enviado exitosamente!', 'success');
                // Reset form
                form.sheetUrl.value = '';
                form.mensaje.value = '';
                form.lineas.value = '';
                form.contador.textContent = '0';
            } else {
                showStatus(`❌ Error: ${result.message || 'No se pudo procesar'}`, 'error');
            }
        } catch (error) {
            console.error('Submission error:', error);
            showStatus(`❌ Error de conexión: ${error.message}`, 'error');
        } finally {
            // UI State: Normal
            form.btnEnviar.disabled = false;
            form.spinner.style.display = 'none';
            form.btnText.textContent = '📨 Enviar Correo';
        }
    };

    // Event Listener for Button
    form.btnEnviar.addEventListener('click', enviarRQ);
});
