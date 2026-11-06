# Informe — experimento A/B de Taller Norte

## Variante B: experiencia de la persona

La persona asignada al tratamiento ve el titular «El curso empieza el 14 de abril. El cupo, no.» y el botón «Reservar mi lugar». Su title es «Abril abre cupos: cursos de oficio en grupos de 12» y su description es «El 14 de abril empiezan grupos de doce. En la cohorte anterior, ocho de cada diez consiguieron trabajo en el rubro antes de los noventa días». El mensaje cambia, pero no la oferta: los cursos de carpintería, electricidad y cocina duran ocho semanas, empiezan el 14 de abril y tienen un cupo de doce personas.

## Vista del crawler

En `/practica`, un crawler recibe siempre la variante de control A: «Ocho semanas para un oficio que se puede cobrar» y el title «Cursos de oficio en ocho semanas, con salida laboral», aunque no conserve cookies. La variante se sirve en la misma URL y con el mismo canonical que usa la experiencia humana. No se crean rutas para A y B ni se elige el mensaje según una query indexable. Es una forma de mantener estable la página para indexación, no de mostrar contenido diferente para manipular el ranking.

## Canonical y asignación

El canonical no cambia porque ambas variantes son mensajes de una misma página y una misma oferta. La URL canónica es `/practica`, sin parámetros; los previews `?preview=a` y `?preview=b` son herramientas de revisión con `noindex`, no páginas adicionales del experimento.

La asignación se calcula con el primer byte del hash SHA-256 del ID del visitante: par corresponde a A e impar a B. Para `lab-visitor-demo-01`, el primer byte es 106, por lo que la función devuelve A en cada ejecución. El caso fijo resulta en 7,50% para A, 13,14% para B y una diferencia de 5,64 puntos porcentuales; esa diferencia no alcanza, por sí sola, para declarar un ganador.
