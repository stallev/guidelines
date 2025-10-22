// Открытие модального окна заказа техники
const equipmentOrderModal = document.getElementById('equipmentOrderModal');
const equipmentOrderForm = document.getElementById('equipmentOrderForm');
const equipmentNameInput = document.getElementById('equipmentName');

// Кнопки заказа на карточках техники
const orderBtns = document.querySelectorAll('.equipment-card__order-btn');
orderBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const equipment = btn.getAttribute('data-equipment');
        equipmentNameInput.value = equipment;
        equipmentOrderModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

// Закрытие модального окна
function closeEquipmentModal() {
    equipmentOrderModal.classList.remove('active');
    document.body.style.overflow = '';
}

document.querySelector('#equipmentOrderModal .modal__close').onclick = closeEquipmentModal;
document.querySelector('#equipmentOrderModal .modal__overlay').onclick = closeEquipmentModal;
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeEquipmentModal();
});

// Маска телефона (простая)
const orderPhone = document.getElementById('orderPhone');
if (orderPhone) {
    orderPhone.addEventListener('input', function(e) {
        let x = orderPhone.value.replace(/\D/g, '').slice(0, 12);
        let formatted = '+375 (';
        if (x.length > 0) formatted += x.substring(0, 2);
        if (x.length >= 2) formatted += ') ' + x.substring(2, 5);
        if (x.length >= 5) formatted += '-' + x.substring(5, 7);
        if (x.length >= 7) formatted += '-' + x.substring(7, 9);
        orderPhone.value = formatted;
    });
}

// Валидация и отправка формы
if (equipmentOrderForm) {
    equipmentOrderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = equipmentOrderForm.orderName.value.trim();
        const phone = equipmentOrderForm.orderPhone.value.trim();
        const privacy = equipmentOrderForm.orderPrivacy.checked;
        if (!name || !phone || !privacy) {
            alert('Пожалуйста, заполните все обязательные поля и согласитесь с политикой.');
            return;
        }
        // Здесь может быть AJAX-запрос
        closeEquipmentModal();
        setTimeout(() => {
            alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
        }, 200);
        equipmentOrderForm.reset();
    });
} 