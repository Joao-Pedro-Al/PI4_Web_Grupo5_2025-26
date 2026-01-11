
document.addEventListener('DOMContentLoaded', function() {
    // Função para alternar entre olho aberto/fechado
    document.querySelectorAll('.toggle-view').forEach(function(icon) {
        icon.addEventListener('click', function() {
            const card = this.closest('.card.notification');
            
            // Alterna entre olho aberto e fechado
            if (this.classList.contains('bi-eye')) {
                this.classList.remove('bi-eye');
                this.classList.add('bi-eye-slash');
                
                // Marca como visto
                card.classList.add('visto');
                card.style.opacity = '0.6';
            } else {
                this.classList.remove('bi-eye-slash');
                this.classList.add('bi-eye');
                
                // Remove marcação de visto
                card.classList.remove('visto');
                card.style.opacity = '1';
            }
        });
    });
    
    // Função para apagar notificação
    document.querySelectorAll('.delete').forEach(function(icon) {
        icon.addEventListener('click', function() {
            const card = this.closest('.card.notification');
            
            // Adiciona animação de fade out
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '0';
            card.style.transform = 'translateX(100px)';
            
            // Remove o card após a animação
            setTimeout(function() {
                card.remove();
                
                // Verifica se não há mais notificações
                const cardsRestantes = document.querySelectorAll('.card.notification');
                if (cardsRestantes.length === 0) {
                    const container = document.querySelector('.conteudo-notificacoes');
                    const mensagem = document.createElement('div');
                    mensagem.className = 'text-center mt-5';
                    mensagem.innerHTML = '<h5 class="text-muted">Nenhuma notificação</h5>';
                    container.appendChild(mensagem);
                }
            }, 300);
        });
    });
    document.addEventListener('DOMContentLoaded', function() {
    // Adiciona evento a todos os cards expansíveis
    document.querySelectorAll('[data-expandable="true"]').forEach(card => {
        card.addEventListener('click', function(e) {
            // Verifica se não foi clique em botão de ação
            if (!e.target.closest('.btn-card-action')) {
                this.classList.toggle('expanded');
            }
        });
        
        // Adiciona evento específico para a seta
        const arrow = card.querySelector('.expand-icon');
        if (arrow) {
            arrow.addEventListener('click', function(e) {
                e.stopPropagation();
                card.classList.toggle('expanded');
            });
        }
    });
});
});
