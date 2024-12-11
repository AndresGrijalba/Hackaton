// script.js

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

  currentMonthEl.textContent = date.toLocaleString("es-ES", { month: "long", year: "numeric" });

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
    const event = events.find((e) => new Date(e.date).toDateString() === new Date(year, month, day).toDateString());
    if (event) {
      cell.classList.add("has-event");
      cell.title = event.crop + " - " + event.area + " m²";
    }

    cell.addEventListener("click", () => {
      alert(event ? `Evento: ${event.crop}\nÁrea: ${event.area} m²` : `No hay eventos para este día.`);
    });

    row.appendChild(cell);

    if ((firstDay + day) % 7 === 0 || day === daysInMonth) {
      calendarBody.appendChild(row);
      row = document.createElement("tr");
    }
  }
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

// Agregar cultivos
addCropBtn.addEventListener("click", () => {
  const cropName = prompt("Nombre del cultivo:");
  if (cropName) {
    cropItems.push(cropName);
    updateCropList();
  }
});

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
  const date = document.querySelector("#date-input").value;

  if (!crop || !area || !date) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  events.push({ crop, area, date });
  alert("Evento agregado con éxito.");
  renderCalendar(currentDate);
});

// Inicializar aplicación
renderCalendar(currentDate);
updateCropList();
