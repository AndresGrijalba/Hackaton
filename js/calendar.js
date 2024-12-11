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

    const cellDate = new Date(year, month, day).toISOString().split("T")[0];
    const startEvent = events.find((e) => e.startDate === cellDate);
    const harvestEvent = events.find((e) => e.harvestDate === cellDate);


    if (startEvent) {
        cell.classList.add("has-start-event");
        cell.style.backgroundColor = "#fef981"; 
        cell.style.cursor = "pointer";
      }
  
      if (harvestEvent) {
        cell.classList.add("has-harvest-event");
        cell.style.backgroundColor = "#d4edda";
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
      const cellDate = new Date(year, month, day).toISOString().split("T")[0];
  
      const dayEvents = events.filter(
        (e) => e.startDate === cellDate || e.harvestDate === cellDate
      );
  
      const selectedDate = new Date(year, month, day).toLocaleDateString();
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
      });
  
      li.appendChild(deleteBtn);
      cropListEl.appendChild(li);
  
      const option = document.createElement("option");
      option.value = crop;
      option.textContent = crop;
      cropSelect.appendChild(option);
    });
  }
  

// Planificar siembra
planForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const crop = cropSelect.value;
  const area = document.querySelector("#area-input").value;
  const dateInput = document.querySelector("#date-input").value;
  const durationInput = document.querySelector("#duration-input").value;


  if (!crop || !area || !dateInput || !durationInput) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  const selectedDate = new Date(dateInput);
  selectedDate.setMinutes(selectedDate.getMinutes() + selectedDate.getTimezoneOffset());

  const harvestDate = new Date(selectedDate);
  harvestDate.setDate(harvestDate.getDate() + parseInt(durationInput));

  events.push({ crop, area, startDate: selectedDate.toISOString().split("T")[0], harvestDate: harvestDate.toISOString().split("T")[0] });
  alert("Evento agregado con éxito.");
  
  renderCalendar(currentDate);
});

// Mostrar modal con eventos del día
function showModal(dayEvents, selectedDate) {
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
        <p><strong>Tipo:</strong> ${
          event.startDate === selectedDate ? "Inicio" : "Cosecha"
        }</p>
        <p><strong>Cultivo:</strong> ${event.crop}</p>
        <p><strong>Área:</strong> ${event.area} m²</p>
        <button class="delete-btn" data-index="${index}">Eliminar</button>
      `;
      modalEventsContainer.appendChild(eventInfo);
    });

    // Manejar eventos de los botones de eliminar
    modalEventsContainer.querySelectorAll(".delete-btn").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const eventIndex = e.target.getAttribute("data-index");

        // Eliminar evento del array
        const eventToDelete = dayEvents[eventIndex];
        events.splice(
          events.findIndex(
            (e) =>
              e.startDate === eventToDelete.startDate &&
              e.harvestDate === eventToDelete.harvestDate
          ),
          1
        );

        alert("Evento eliminado con éxito.");
        modal.remove(); // Cerrar modal después de eliminar
        renderCalendar(currentDate); // Actualizar calendario
      })
    );
  } else {
    modalEventsContainer.innerHTML = "<p>No hay eventos para este día.</p>";
  }

  modal.style.display = "block";

  modal.querySelector("#close-modal").addEventListener("click", () => {
    modal.remove();
  });
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
    renderCalendar(currentDate); // Actualizar calendario
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
    }, 500); // Tiempo debe coincidir con la duración de la animación (0.5s)
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
