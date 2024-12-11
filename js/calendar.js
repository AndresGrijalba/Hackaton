// Variables globales
const cropItems = []; // Lista de cultivos
const events = []; // Lista de eventos en el calendario

// Elementos del DOM
const calendarBody = document.querySelector("#calendar tbody");
const currentMonthEl = document.querySelector("#current-month");
const prevMonthBtn = document.querySelector("#prev-month");
const nextMonthBtn = document.querySelector("#next-month");
const cropListEl = document.querySelector("#crop-items");
const addCropBtn = document.querySelector("#add-crop-btn");
const planForm = document.querySelector("#plan-form");
const cropSelect = document.querySelector("#crop-select");

// Fecha actual
let currentDate = new Date();

// Renderizar calendario
function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  currentMonthEl.textContent = date
    .toLocaleString("es-ES", { month: "long", year: "numeric" })
    .replace(/^./, (match) => match.toUpperCase());

  // Obtener el primer día del mes y el número de días
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  calendarBody.innerHTML = ""; // Limpiar calendario

  // Rellenar celdas
  let row = document.createElement("tr");
  for (let i = 0; i < firstDay; i++) {
    row.appendChild(document.createElement("td")); // Días vacíos
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("td");
    cell.textContent = day;

    // Buscar eventos
    const event = events.find(
      (e) =>
        new Date(e.date).toDateString() ===
        new Date(year, month, day).toDateString()
    );
    if (event) {
      cell.classList.add("has-event");
      cell.style.backgroundColor = "#cce5ff"; // Color de resaltado
      cell.style.cursor = "pointer";
    }

    attachCellClickHandler(cell, day, year, month);

    row.appendChild(cell);

    if ((firstDay + day) % 7 === 0 || day === daysInMonth) {
      calendarBody.appendChild(row);
      row = document.createElement("tr");
    }
  }
}

// Adjuntar manejador de clic para las celdas del calendario
function attachCellClickHandler(cell, day, year, month) {
  cell.addEventListener("click", () => {
    const selectedDate = new Date(year, month, day).toLocaleDateString();
    const dayEvents = events.filter(
      (e) =>
        new Date(e.date).toDateString() ===
        new Date(year, month, day).toDateString()
    );
    showModal(dayEvents, selectedDate);
  });
}

// Navegar entre meses
prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});
nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});

addCropBtn.addEventListener("click", openCropModal);


// Actualizar lista de cultivos
function updateCropList() {
    cropListEl.innerHTML = "";
    cropSelect.innerHTML = "";
  
    cropItems.forEach((crop, index) => {
      const li = document.createElement("li");
      li.textContent = crop;
  
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Eliminar";
      deleteBtn.style.marginLeft = "10px";
      deleteBtn.addEventListener("click", () => {
        // Verificar si el cultivo está asociado con algún evento
        const isCropInUse = events.some((event) => event.crop === crop);
  
        if (isCropInUse) {
          alert(
            `No se puede eliminar el cultivo "${crop}" porque tiene registros asociados.`
          );
          return;
        }
  
        // Si no está en uso, eliminar el cultivo
        cropItems.splice(index, 1);
        updateCropList();
  
        // Mostrar modal de confirmación
        showDeleteConfirmationModal();
      });
  
      li.appendChild(deleteBtn);
      cropListEl.appendChild(li);
  
      const option = document.createElement("option");
      option.value = crop;
      option.textContent = crop;
      cropSelect.appendChild(option);
    });
  }
  
  // Función para mostrar el modal de confirmación
  function showDeleteConfirmationModal() {
    const modal = document.getElementById("delete-confirmation-modal");
    modal.style.display = "block";
  
    // Ocultar modal automáticamente después de 2 segundos
    setTimeout(() => {
      modal.style.display = "none";
    }, 2000);
  }

planForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const crop = cropSelect.value;
  const area = document.querySelector("#area-input").value;
  const dateInput = document.querySelector("#date-input").value;

  if (!crop || !area || !dateInput) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  // Crear un objeto Date a partir de la fecha ingresada
  const selectedDate = new Date(dateInput);

  // Ajustar la fecha para que no haya problemas de zona horaria
  selectedDate.setMinutes(selectedDate.getMinutes() + selectedDate.getTimezoneOffset());

  // Agregar el nuevo evento al arreglo
  events.push({ crop, area, date: selectedDate.toISOString() });
  alert("Evento agregado con éxito.");
  
  // Renderizar el calendario nuevamente para mostrar el evento
  renderCalendar(currentDate);
});

// Mostrar modal con eventos del día
function showModal(dayEvents, selectedDate) {
  // Crear dinámicamente un modal para evitar conflictos
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Eventos del día ${selectedDate}</h2>
      <div id="modal-events"></div>
      <button id="close-modal">Cerrar</button>
    </div>
  `;
  document.body.appendChild(modal);

  const modalEventsContainer = modal.querySelector("#modal-events");

  if (dayEvents.length > 0) {
    dayEvents.forEach((event, index) => {
      const eventInfo = document.createElement("div");
      eventInfo.classList.add("event-info");
      eventInfo.innerHTML = `
        <p><strong>Cultivo:</strong> ${event.crop}</p>
        <p><strong>Área:</strong> ${event.area} m²</p>
        <p><strong>Fecha:</strong> ${new Date(event.date).toLocaleDateString()}</p>
        <button class="view-btn" data-index="${index}">Ver</button>
        <button class="edit-btn" data-index="${index}">Editar</button>
        <button class="delete-btn" data-index="${index}">Eliminar</button>
      `;
      modalEventsContainer.appendChild(eventInfo);
    });
  } else {
    modalEventsContainer.innerHTML = "<p>No hay eventos para este día.</p>";
  }

  // Mostrar modal
  modal.style.display = "block";

  // Manejar cierre del modal
  modal.querySelector("#close-modal").addEventListener("click", () => {
    modal.remove(); // Eliminar modal del DOM
  });

  // Manejar eventos de los botones
  modalEventsContainer.querySelectorAll(".view-btn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const eventIndex = e.target.getAttribute("data-index");
      viewEvent(dayEvents[eventIndex]);
    })
  );

  modalEventsContainer.querySelectorAll(".edit-btn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const eventIndex = e.target.getAttribute("data-index");
      editEvent(dayEvents[eventIndex]);
    })
  );

  modalEventsContainer.querySelectorAll(".delete-btn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const eventIndex = e.target.getAttribute("data-index");
      deleteEvent(dayEvents[eventIndex]);
      modal.remove(); // Cerrar modal después de eliminar
      renderCalendar(currentDate); // Actualizar calendario
    })
  );
}

// Ver evento
function viewEvent(event) {
  alert(`Detalles del Evento:
Cultivo: ${event.crop}
Área: ${event.area} m²
Fecha: ${new Date(event.date).toLocaleDateString()}`);
}

// Editar evento
function editEvent(event) {
  const newCrop = prompt("Editar cultivo:", event.crop);
  const newArea = prompt("Editar área (m²):", event.area);

  if (newCrop && newArea) {
    event.crop = newCrop;
    event.area = newArea;
    alert("Evento editado con éxito.");
    renderCalendar(currentDate); // Actualizar calendario
  }
}

// Eliminar evento
function deleteEvent(event) {
  const index = events.findIndex(
    (e) => e.date === event.date && e.crop === event.crop
  );
  if (index > -1) {
    events.splice(index, 1);
    alert("Evento eliminado con éxito.");
    renderCalendar(currentDate);
  }
}

function openCropModal() {
    const modal = document.getElementById("add-crop-modal");
    modal.classList.remove("close");
    modal.classList.add("open");
    modal.style.display = "block";
  }
  
  function closeCropModal() {
    const modal = document.getElementById("add-crop-modal");
    modal.classList.remove("open");
    modal.classList.add("close");
  
    setTimeout(() => {
      modal.style.display = "none";
    }, 500); 
  }
  
  
  // Manejar el envío del formulario del modal
  const addCropForm = document.getElementById("add-crop-form");
  addCropForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const cropNameInput = document.getElementById("crop-name");
    const cropName = cropNameInput.value.trim();
  
    if (!cropName) {
      alert("Por favor, ingrese un nombre válido para el cultivo.");
      return;
    }
  
    // Agregar el cultivo a la lista
    cropItems.push(cropName);
    updateCropList();
  
    // Cerrar el modal y limpiar el campo
    closeCropModal();
    cropNameInput.value = "";
  });
  
  // Modificar el botón "Agregar Cultivo" para usar el modal
  addCropBtn.addEventListener("click", openCropModal);
  

// Inicializar aplicación
renderCalendar(currentDate);
updateCropList();
