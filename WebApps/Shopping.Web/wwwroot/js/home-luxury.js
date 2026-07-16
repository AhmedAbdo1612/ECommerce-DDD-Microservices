// Delete Modal Setup
function confirmDelete(productId, productName) {
    document.getElementById('deleteProductName').innerText = productName;
    document.getElementById('deleteProductId').value = productId;
    var myModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    myModal.show();
}

// Scroll Reveal Animation Logic
document.addEventListener("DOMContentLoaded", function() {
    const reveals = document.querySelectorAll(".reveal");
    
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
        });
    }, revealOptions);
    
    reveals.forEach(reveal => {
        revealOnScroll.observe(reveal);
    });
});
