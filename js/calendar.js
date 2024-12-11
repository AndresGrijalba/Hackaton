document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('calendar');
    const currentDate = new Date();
    
    const renderCalendar = () => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        calendar.innerHTML = `
            <div class="calendar-header">
                <button id="prev-month">&lt;</button>
                <h3>${new Date(year, month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h3>
                <button id="next-month">&gt;</button>
            </div>
            <div class="calendar-grid">
                ${Array.from({ length: 42 }).map((_, i) => `<div class="calendar-day"></div>`).join('')}
            </div>
        `;
    };

    renderCalendar();
    calendar.addEventListener('click', (e) => {
        if (e.target.id === 'prev-month') currentDate.setMonth(currentDate.getMonth() - 1);
        if (e.target.id === 'next-month') currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
});
