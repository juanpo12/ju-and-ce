-- Todo se apoya en una sola pregunta: ¿el usuario pertenece al espacio de esta
-- fila? Se resuelve una vez acá y se reutiliza en todas las políticas.
--
-- security definer a propósito: necesita leer `perfiles` sin quedar atrapada en
-- la RLS de esa misma tabla (si no, la política de perfiles llamaría a
-- mi_espacio(), que lee perfiles, que dispara la política... recursión infinita).
-- search_path vacío y todo calificado: es lo que exige el linter de Supabase
-- para una función security definer.
create or replace function public.mi_espacio()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select espacio_id from public.perfiles where id = (select auth.uid())
$$;
--> statement-breakpoint

revoke all on function public.mi_espacio() from public;
--> statement-breakpoint
grant execute on function public.mi_espacio() to authenticated;
--> statement-breakpoint

-- Una fila por entrada, con el promedio de la pareja ya resuelto.
--
-- security_invoker = on NO es opcional: sin eso la vista corre con los permisos
-- de quien la creó (el dueño de la base) y saltea la RLS de las tablas de abajo,
-- o sea que cualquier usuario autenticado vería la libreta de todos.
create or replace view public.v_entradas_puntuadas
with (security_invoker = on) as
select e.*,
       p.titulo,
       p.anio,
       p.duracion_min,
       p.generos,
       p.poster_path,
       avg(pt.estrellas)      as promedio,
       count(pt.perfil_id)    as cuantos_puntuaron
from public.entradas e
join public.peliculas p on p.tmdb_id = e.tmdb_id
left join public.puntajes pt on pt.entrada_id = e.id
group by e.id, p.tmdb_id;
--> statement-breakpoint

-- Conteo por género: un género por fila.
create or replace view public.v_por_genero
with (security_invoker = on) as
select e.espacio_id,
       g as genero,
       count(*) as cantidad
from public.entradas e
join public.peliculas p on p.tmdb_id = e.tmdb_id
cross join lateral unnest(p.generos) as g
where e.estado = 'vista'
group by e.espacio_id, g;
--> statement-breakpoint

grant select on public.v_entradas_puntuadas to authenticated;
--> statement-breakpoint
grant select on public.v_por_genero to authenticated;
--> statement-breakpoint

-- Los números sueltos de la pantalla de resumen en un solo JSON: un round trip
-- en vez de cuatro. NO es security definer: corre como el usuario, así la RLS de
-- las tablas de abajo sigue aplicando y el `where` es apenas una segunda red.
create or replace function public.resumen()
returns json
language sql
stable
set search_path = ''
as $$
  select json_build_object(
    'vistas',      count(*),
    'promedio',    round(avg(v.promedio)::numeric, 1),
    'horas',       round(sum(v.duracion_min) / 60.0),
    'coincidimos', count(*) filter (where v.cuantos_puntuaron = 2)
  )
  from public.v_entradas_puntuadas v
  where v.espacio_id = public.mi_espacio() and v.estado = 'vista';
$$;
--> statement-breakpoint

revoke all on function public.resumen() from public;
--> statement-breakpoint
grant execute on function public.resumen() to authenticated;
