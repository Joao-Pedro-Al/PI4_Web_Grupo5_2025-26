-- ============================================================
-- PROCEDIMENTO E TRIGGER DE NOTIFICAÇÕES AUTOMÁTICAS (POSTGRESQL)
-- ============================================================

-- 1. Procedimento auxiliar para criar notificação na tabela 'notificacao'
CREATE OR REPLACE PROCEDURE public.criarnotificacao(
    p_idutilizadorprefil INT,
    p_titulo VARCHAR,
    p_descricao TEXT,
    p_visto BOOLEAN DEFAULT FALSE
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.notificacao (prefil, titulo, descricao, visto)
    VALUES (p_idutilizadorprefil, p_titulo, p_descricao, COALESCE(p_visto, FALSE));
END;
$$;

-- 2. Função Trigger que gere os eventos INSERT, UPDATE e DELETE na tabela 'consultas'
CREATE OR REPLACE FUNCTION public.enviarnotificacao()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- CASO 1: NOVA CONSULTA CRIADA (INSERT)
    IF (TG_OP = 'INSERT') THEN
        CALL public.criarnotificacao(
            NEW.idutilizadorprefil,
            'Consulta Agendada',
            ('A sua consulta no dia ' || TO_CHAR(NEW.data, 'DD-MM-YYYY') || ' às ' || NEW.hora || ' foi agendada.'),
            false
        );

    -- CASO 2: CONSULTA ATUALIZADA (UPDATE)
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Subcaso 2.1: Data ou Hora alteradas
        IF (OLD.data != NEW.data OR OLD.hora != NEW.hora) THEN
            CALL public.criarnotificacao(
                NEW.idutilizadorprefil,
                'Consulta remarcada!',
                ('A sua consulta no dia ' || TO_CHAR(OLD.data, 'DD-MM-YYYY') || ' foi remarcada para ' || TO_CHAR(NEW.data, 'DD-MM-YYYY') || ' às ' || NEW.hora || '.'),
                false
            );
        -- Subcaso 2.2: Falta marcada (falta mudou de false para true)
        ELSIF (OLD.falta = false AND NEW.falta = true) THEN
            CALL public.criarnotificacao(
                NEW.idutilizadorprefil,
                'Remarcar Consulta',
                ('Por favor nos contacte para podermos remarcar a consulta que estava prevista para o dia ' || TO_CHAR(OLD.data, 'DD-MM-YYYY') || '.'),
                false
            );
        END IF;

    -- CASO 3: CONSULTA ELIMINADA (DELETE)
    ELSIF (TG_OP = 'DELETE') THEN
        -- Notificar apenas se a consulta desmarcada for futura ou do dia atual
        IF (OLD.data >= CURRENT_DATE) THEN
            CALL public.criarnotificacao(
                OLD.idutilizadorprefil,
                'Consulta desmarcada!',
                ('A sua consulta no dia ' || TO_CHAR(OLD.data, 'DD-MM-YYYY') || ' foi desmarcada.'),
                false
            );
        END IF;
    END IF;

    RETURN NULL;
END;
$$;

-- 3. Criação do Trigger associado à tabela 'consultas'
DROP TRIGGER IF EXISTS enviarnotificacao ON public.consultas;

CREATE TRIGGER enviarnotificacao
AFTER INSERT OR UPDATE OR DELETE ON public.consultas
FOR EACH ROW
EXECUTE FUNCTION public.enviarnotificacao();
