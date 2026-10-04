"""
Genera las texturas de los tres temas ilustrados (hongo, mariposas, campanitas).

    python3 scripts/arte-hadas.py

Cada pieza (hada, mariposa, hongo, campanitas, lavanda, helecho, luna) se
dibuja en su propio sistema de coordenadas y se ubica con g(transform). Los
colores del dibujo van escritos en el SVG porque un data URI no ve las
variables CSS: por eso hay una paleta por modo.

Output: each SVG goes to `public/textures/<theme>-<hash>.svg` (the content hash
in the name lets browsers cache it forever) and each theme's CSS to
`styles/themes/<theme>.ts`.
"""
import hashlib, math, pathlib, re

TEXTURES = pathlib.Path('public/textures')
CURRENT = None  # the theme being drawn, for the file name

def uri(svg):
    svg = re.sub(r'\s+', ' ', svg).strip()
    name = f"{CURRENT}-{hashlib.sha256(svg.encode()).hexdigest()[:10]}.svg"
    (TEXTURES / name).write_text(svg)
    return f"url('/textures/{name}')"

def g(t, *hijos):
    return f"<g transform='{t}'>{''.join(hijos)}</g>"

def destello(x, y, r, c, o=1):
    k = r * 0.18
    return (f"<path d='M{x} {y-r} Q{x+k} {y-k} {x+r} {y} Q{x+k} {y+k} {x} {y+r} "
            f"Q{x-k} {y+k} {x-r} {y} Q{x-k} {y-k} {x} {y-r}Z' fill='{c}' opacity='{o}'/>")

def hada(ala, cuerpo, pelo, polvo, piel, varita=True):
    """Hada de frente con alas de libélula, vestido de pétalos y varita. ~70 de alto, origen al centro."""
    alas = ''.join([
        f"<path d='M-2 -8 C -14 -30, -34 -30, -30 -16 C -27 -6, -12 -4, -2 -8Z'/>",
        f"<path d='M-2 -6 C -12 0, -26 10, -20 16 C -14 20, -6 6, -2 -6Z'/>",
    ])
    alas_svg = (f"<g fill='{ala}' fill-opacity='.45' stroke='{ala}' stroke-width='.9'>{alas}"
                f"<g transform='scale(-1 1)'>{alas}</g></g>"
                # nervaduras
                f"<g stroke='{ala}' stroke-width='.5' fill='none' opacity='.8'>"
                f"<path d='M-3 -8 Q-16 -18 -26 -19'/><path d='M3 -8 Q16 -18 26 -19'/>"
                f"<path d='M-3 -6 Q-12 4 -18 12'/><path d='M3 -6 Q12 4 18 12'/></g>")
    persona = (
        # pelo largo detrás
        f"<path d='M-6 -24 Q-9 -12 -7 -6 L7 -6 Q9 -12 6 -24 Q0 -30 -6 -24Z' fill='{pelo}'/>"
        f"<circle cx='0' cy='-21' r='5' fill='{piel}'/>"
        f"<path d='M-5.5 -23 Q0 -29 5.5 -23 Q3 -25 0 -25 Q-3 -25 -5.5 -23Z' fill='{pelo}'/>"
        # corona de flores
        f"<circle cx='-4' cy='-25' r='1.1' fill='{polvo}'/><circle cx='0' cy='-26.3' r='1.1' fill='{polvo}'/>"
        f"<circle cx='4' cy='-25' r='1.1' fill='{polvo}'/>"
        # vestido de pétalos
        f"<path d='M-3 -16 L3 -16 L5 -6 L11 8 L6 5 L3 10 L0 6 L-3 10 L-6 5 L-11 8 L-5 -6Z' fill='{cuerpo}'/>"
        # piernas
        f"<path d='M-2 8 L-3 19 M2 8 L4 18' stroke='{piel}' stroke-width='1.6' stroke-linecap='round'/>"
        # brazos
        f"<path d='M-3 -14 Q-9 -8 -10 -2' stroke='{piel}' stroke-width='1.5' fill='none' stroke-linecap='round'/>"
    )
    if varita:
        persona += (f"<path d='M3 -14 Q9 -18 12 -24' stroke='{piel}' stroke-width='1.5' fill='none' stroke-linecap='round'/>"
                    f"<path d='M12 -24 L17 -33' stroke='{cuerpo}' stroke-width='.9' stroke-linecap='round'/>"
                    + destello(17.5, -34, 4.5, polvo)
                    + f"<circle cx='23' cy='-30' r='.9' fill='{polvo}'/><circle cx='27' cy='-24' r='.7' fill='{polvo}'/>"
                    f"<circle cx='30' cy='-17' r='.5' fill='{polvo}'/>")
    else:
        persona += f"<path d='M3 -14 Q9 -8 10 -2' stroke='{piel}' stroke-width='1.5' fill='none' stroke-linecap='round'/>"
    return alas_svg + persona

def hada_sentada(ala, cuerpo, pelo, polvo, piel):
    """Sentada de perfil, mirando hacia arriba, como la del hongo. Origen en el asiento."""
    alas = (f"<g fill='{ala}' fill-opacity='.45' stroke='{ala}' stroke-width='.9'>"
            f"<path d='M-2 -22 C -10 -46, -30 -50, -28 -34 C -26 -24, -12 -20, -2 -22Z'/>"
            f"<path d='M-2 -20 C -14 -18, -26 -8, -20 -2 C -14 2, -6 -10, -2 -20Z'/></g>"
            f"<g stroke='{ala}' stroke-width='.5' fill='none' opacity='.8'><path d='M-3 -22 Q-14 -34 -24 -38'/>"
            f"<path d='M-3 -20 Q-12 -12 -18 -4'/></g>")
    return alas + (
        # pelo largo ondulado por la espalda
        f"<path d='M-4 -36 Q-9 -30 -7 -22 Q-10 -16 -6 -10 L-1 -12 Q-3 -20 0 -26 Z' fill='{pelo}'/>"
        f"<circle cx='1' cy='-34' r='5' fill='{piel}'/>"
        f"<path d='M-4 -36 Q1 -42 6 -36 Q2 -38 -1 -37Z' fill='{pelo}'/>"
        f"<circle cx='-3' cy='-38' r='1' fill='{polvo}'/><circle cx='1' cy='-39.5' r='1' fill='{polvo}'/>"
        f"<circle cx='5' cy='-38' r='1' fill='{polvo}'/>"
        # torso y vestido
        f"<path d='M-3 -29 L4 -29 L5 -14 L10 -2 L-4 0 L-5 -14Z' fill='{cuerpo}'/>"
        # rodillas arriba, piernas colgando
        f"<path d='M3 -3 L14 -10 L16 2' stroke='{piel}' stroke-width='2.4' fill='none' stroke-linecap='round' stroke-linejoin='round'/>"
        # brazos abrazando las rodillas
        f"<path d='M3 -26 Q8 -16 13 -9' stroke='{piel}' stroke-width='1.5' fill='none' stroke-linecap='round'/>"
    )

def mariposa(ala1, ala2, cuerpo):
    arriba = "<path d='M0 -1 C -5 -15, -21 -18, -17 -4 C -15 3, -6 3, 0 -1Z'/>"
    abajo = "<path d='M0 0 C -4 4, -15 9, -10 14 C -5 17, -1 8, 0 0Z'/>"
    lado = f"<g fill='{ala1}'>{arriba}</g><g fill='{ala2}'>{abajo}</g>"
    return (lado + f"<g transform='scale(-1 1)'>{lado}</g>"
            f"<circle cx='-9' cy='-7' r='2' fill='{ala2}' opacity='.9'/><circle cx='9' cy='-7' r='2' fill='{ala2}' opacity='.9'/>"
            f"<ellipse cx='0' cy='2' rx='1.3' ry='7' fill='{cuerpo}'/>"
            f"<path d='M-.5 -4 Q-2 -11 -6 -13 M.5 -4 Q2 -11 6 -13' stroke='{cuerpo}' stroke-width='.7' fill='none'/>")

def hongo(sombrero, pie, lunar, escala=1):
    return (f"<path d='M-5 0 Q-7 -16 -4 -20 L4 -20 Q7 -16 5 0 Q0 2 -5 0Z' fill='{pie}'/>"
            f"<path d='M-4 -12 Q0 -10 4 -12 L4.6 -14 Q0 -12 -4.6 -14Z' fill='{sombrero}' opacity='.35'/>"
            f"<path d='M-20 -18 Q-19 -40 0 -41 Q19 -40 20 -18 Q0 -22 -20 -18Z' fill='{sombrero}'/>"
            f"<path d='M-18 -19 Q0 -16 18 -19' stroke='{pie}' stroke-width='1' fill='none' opacity='.7'/>"
            f"<circle cx='-9' cy='-30' r='2.6' fill='{lunar}'/><circle cx='3' cy='-35' r='2' fill='{lunar}'/>"
            f"<circle cx='11' cy='-26' r='2.4' fill='{lunar}'/><circle cx='-2' cy='-25' r='1.5' fill='{lunar}'/>")

def campanitas(tallo, hoja, flor, n=5):
    """Lirio de los valles: tallo arqueado con campanitas colgando. Origen abajo."""
    partes = [f"<path d='M0 0 Q-16 -40 -3 -84 Q6 -40 0 0Z' fill='{hoja}'/>",
              f"<path d='M0 0 Q2 -50 30 -66' stroke='{tallo}' stroke-width='1.4' fill='none'/>"]
    for i in range(n):
        t = 0.35 + i * 0.6 / (n - 1)
        # punto sobre la curva cuadrática
        x = 2*(1-t)*t*2 + t*t*30
        y = 2*(1-t)*t*-50 + t*t*-66
        largo = 7 - i * 0.6
        partes.append(f"<path d='M{x:.1f} {y:.1f} q1 {largo/2:.1f} 0 {largo:.1f}' stroke='{tallo}' stroke-width='.8' fill='none'/>")
        bx, by = x, y + largo
        s = 1 - i * 0.1
        partes.append(g(f"translate({bx:.1f} {by:.1f}) scale({s:.2f})",
                        f"<path d='M-4 0 Q-5 6 -6 8 Q-3 7 -2 9 Q0 7 2 9 Q3 7 6 8 Q5 6 4 0 Q0 -2 -4 0Z' fill='{flor}' stroke='{tallo}' stroke-width='.4'/>"))
    return ''.join(partes)

def lavanda(tallo, flor):
    partes = [f"<path d='M0 0 Q2 -40 -4 -80' stroke='{tallo}' stroke-width='1.2' fill='none'/>"]
    for i in range(9):
        t = 0.45 + i * 0.065
        x = 2*(1-t)*t*2 + t*t*-4
        y = 2*(1-t)*t*-40 + t*t*-80
        partes.append(f"<ellipse cx='{x-1.8:.1f}' cy='{y:.1f}' rx='2' ry='3' fill='{flor}' transform='rotate(-25 {x-1.8:.1f} {y:.1f})'/>")
        partes.append(f"<ellipse cx='{x+1.8:.1f}' cy='{y+1.5:.1f}' rx='2' ry='3' fill='{flor}' transform='rotate(25 {x+1.8:.1f} {y+1.5:.1f})'/>")
    return ''.join(partes)

def helecho(c):
    partes = [f"<path d='M0 0 Q4 -40 -6 -70 Q-14 -76 -10 -64' stroke='{c}' stroke-width='1.3' fill='none'/>"]
    for i in range(8):
        t = 0.1 + i * 0.1
        x = 2*(1-t)*t*4 + t*t*-6
        y = 2*(1-t)*t*-40 + t*t*-70
        l = 12 - i
        partes.append(f"<path d='M{x:.1f} {y:.1f} q-{l} -3 -{l+2} -8' stroke='{c}' stroke-width='1' fill='none'/>")
        partes.append(f"<path d='M{x:.1f} {y:.1f} q{l} -3 {l+2} -8' stroke='{c}' stroke-width='1' fill='none'/>")
    return ''.join(partes)

def luna(x, y, r, c, o=1):
    return (f"<path d='M{x} {y-r} A{r} {r} 0 1 0 {x} {y+r} A{r*1.25:.1f} {r*1.25:.1f} 0 0 1 {x} {y-r}Z' "
            f"fill='{c}' opacity='{o}'/>")

def svg(w, h, cuerpo, opacidad=1):
    return uri(f"<svg xmlns='http://www.w3.org/2000/svg' width='{w}' height='{h}' viewBox='0 0 {w} {h}'>"
               f"<g opacity='{opacidad}'>{cuerpo}</g></svg>")


def polvo_de(c, pts):
    return ''.join(f"<circle cx='{x}' cy='{y}' r='{r}' fill='{c}'/>" for x, y, r in pts)

# ---------------------------------------------------------------- hada del hongo
def hongo_marcos(k, o):
    der = svg(220, 280, ''.join([
        g('translate(206 282) rotate(-8) scale(1.7)', helecho(k['tallo'])),
        g('translate(190 280) scale(-1.25 1.25)', campanitas(k['tallo'], k['hoja'], k['flor'])),
        g('translate(26 282) scale(1.35)', lavanda(k['tallo'], k['lavanda'])),
        g('translate(40 282) rotate(9) scale(1.1)', lavanda(k['tallo'], k['lavanda'])),
        g('translate(118 280) scale(2.4)', hongo(k['sombrero'], k['pie'], k['lunar'])),
        g('translate(66 280) scale(1.15)', hongo(k['sombrero2'], k['pie'], k['lunar'])),
        g('translate(114 186) scale(1.3)', hada_sentada(k['ala'], k['vestido'], k['pelo'], k['polvo'], k['piel'])),
        g('translate(48 150) rotate(-18) scale(.85)', mariposa(k['mar1'], k['mar2'], k['tallo'])),
        destello(150, 120, 6, k['polvo']), destello(170, 150, 3.5, k['polvo']), destello(80, 110, 4, k['polvo']),
    ]), o)
    izq = svg(160, 220, ''.join([
        g('translate(20 222) rotate(10) scale(1.5)', helecho(k['tallo'])),
        g('translate(50 220) scale(1.3)', campanitas(k['tallo'], k['hoja'], k['flor'])),
        g('translate(110 222) scale(1.2)', lavanda(k['tallo'], k['lavanda'])),
        g('translate(96 220) scale(1.05)', hongo(k['sombrero'], k['pie'], k['lunar'])),
        g('translate(130 220) scale(.7)', hongo(k['sombrero2'], k['pie'], k['lunar'])),
        destello(120, 110, 4, k['polvo']),
    ]), o)
    arriba = svg(160, 120, ''.join([
        luna(122, 40, 18, k['polvo']),
        destello(80, 22, 5, k['polvo']), destello(146, 88, 3.5, k['polvo']), destello(30, 50, 3, k['polvo']),
        g('translate(62 78) rotate(-12) scale(.8)', hada(k['ala'], k['vestido'], k['pelo'], k['polvo'], k['piel'])),
    ]), o)
    return der, izq, arriba

def hongo_trama(k, o):
    return svg(300, 300, ''.join([
        destello(40, 50, 6, k['polvo']), destello(200, 30, 3.5, k['polvo']), destello(150, 160, 5, k['polvo']),
        destello(260, 220, 4, k['lavanda']), destello(70, 250, 3.5, k['lavanda']),
        polvo_de(k['polvo'], [(110, 90, 1.2), (240, 120, 1), (30, 160, 1.2), (180, 270, 1)]),
    ]), o)

# ---------------------------------------------------------- vuelo de mariposas
def mariposas_marcos(k, o):
    estela = polvo_de(k['polvo'], [(140, 110, 1.6), (152, 124, 1.3), (160, 140, 1.1), (164, 158, .9), (170, 176, .8), (172, 196, .6)])
    der = svg(220, 280, ''.join([
        g('translate(196 282) scale(-1.5 1.5)', campanitas(k['tallo'], k['hoja'], k['flor'])),
        g('translate(130 282) scale(1.4)', lavanda(k['tallo'], k['lavanda'])),
        g('translate(145 282) rotate(12) scale(1.2)', lavanda(k['tallo'], k['lavanda'])),
        g('translate(60 282) rotate(-6) scale(1.5)', helecho(k['tallo'])),
        estela,
        g('translate(110 120) rotate(-10) scale(1.7)', hada(k['ala'], k['vestido'], k['pelo'], k['polvo'], k['piel'])),
        g('translate(40 60) rotate(-20)', mariposa(k['mar1'], k['mar2'], k['tallo'])),
        g('translate(190 60) rotate(15) scale(.8)', mariposa(k['mar3'], k['mar1'], k['tallo'])),
        g('translate(60 200) rotate(8) scale(.7)', mariposa(k['mar2'], k['mar3'], k['tallo'])),
        destello(150, 30, 4, k['polvo']), destello(24, 130, 3, k['polvo']),
    ]), o)
    izq = svg(160, 220, ''.join([
        g('translate(40 222) scale(1.4)', lavanda(k['tallo'], k['lavanda'])),
        g('translate(55 222) rotate(10) scale(1.15)', lavanda(k['tallo'], k['lavanda'])),
        g('translate(100 220) scale(1.2)', campanitas(k['tallo'], k['hoja'], k['flor'])),
        g('translate(110 70) rotate(18) scale(.9)', mariposa(k['mar1'], k['mar2'], k['tallo'])),
    ]), o)
    arriba = svg(160, 120, ''.join([
        g('translate(110 50) rotate(-15) scale(.9)', mariposa(k['mar3'], k['mar1'], k['tallo'])),
        g('translate(50 80) rotate(20) scale(.6)', mariposa(k['mar2'], k['mar3'], k['tallo'])),
        destello(140, 95, 4, k['polvo']), destello(40, 30, 3, k['polvo']),
    ]), o)
    return der, izq, arriba

def mariposas_trama(k, o):
    return svg(320, 320, ''.join([
        g('translate(60 70) rotate(-20) scale(.55)', mariposa(k['mar1'], k['mar2'], k['tallo'])),
        g('translate(230 150) rotate(15) scale(.45)', mariposa(k['mar3'], k['mar1'], k['tallo'])),
        g('translate(110 260) rotate(-5) scale(.4)', mariposa(k['mar2'], k['mar3'], k['tallo'])),
        destello(180, 40, 4, k['polvo']), destello(290, 280, 3.5, k['polvo']), destello(30, 190, 3, k['polvo']),
        polvo_de(k['polvo'], [(140, 150, 1.1), (260, 60, 1), (200, 230, 1.2)]),
    ]), o)

# ------------------------------------------------------------------ campanitas
def campanitas_marcos(k, o):
    der = svg(220, 280, ''.join([
        g('translate(200 282) rotate(-6) scale(1.6)', helecho(k['tallo'])),
        g('translate(170 282) scale(-2.3 2.3)', campanitas(k['tallo'], k['hoja'], k['flor'], 6)),
        g('translate(120 282) scale(-1.7 1.7)', campanitas(k['tallo'], k['hoja'], k['flor'])),
        g('translate(60 280) scale(1.2)', hongo(k['sombrero'], k['pie'], k['lunar'])),
        g('translate(92 280) scale(.75)', hongo(k['sombrero'], k['pie'], k['lunar'])),
        g('translate(60 236) scale(.95)', hada_sentada(k['ala'], k['vestido'], k['pelo'], k['polvo'], k['piel'])),
        g('translate(46 110) rotate(-8) scale(1.25)', hada(k['ala'], k['vestido2'], k['pelo2'], k['polvo'], k['piel'])),
        polvo_de(k['polvo'], [(76, 72, 1.3), (86, 60, 1), (98, 52, .8)]),
        destello(140, 40, 4, k['polvo']), destello(20, 180, 3, k['polvo']),
    ]), o)
    izq = svg(160, 220, ''.join([
        g('translate(40 222) scale(1.9)', campanitas(k['tallo'], k['hoja'], k['flor'], 6)),
        g('translate(100 222) rotate(8) scale(1.3)', helecho(k['tallo'])),
        g('translate(130 220) scale(.8)', hongo(k['sombrero'], k['pie'], k['lunar'])),
        destello(120, 90, 4, k['polvo']),
    ]), o)
    arriba = svg(160, 120, ''.join([
        luna(120, 42, 17, k['polvo']),
        destello(70, 26, 4.5, k['polvo']), destello(148, 92, 3, k['polvo']), destello(30, 70, 3.5, k['polvo']),
        polvo_de(k['polvo'], [(90, 60, 1), (50, 44, 1.2), (100, 96, .9)]),
    ]), o)
    return der, izq, arriba

def campanitas_trama(k, o):
    return svg(280, 280, ''.join([
        destello(40, 40, 5, k['polvo']), destello(190, 90, 3.5, k['polvo']), destello(110, 200, 4.5, k['polvo']),
        destello(250, 240, 3, k['polvo']),
        polvo_de(k['polvo'], [(90, 110, 1.2), (230, 30, 1), (30, 230, 1.1), (160, 160, .9)]),
    ]), o)

# ---------------------------------------------------------------- paletas del dibujo
HONGO = {
 'claro': dict(tallo='#6d8a55', hoja='#9db67c', flor='#fffdf6', lavanda='#a58bd6', sombrero='#b9a1d6', sombrero2='#d8c6a8',
               pie='#f1e8da', lunar='#f4eefa', ala='#a58bd6', vestido='#5f7f45', pelo='#9a6a3a', piel='#f1d3b8',
               polvo='#d9a82e', mar1='#b79be0', mar2='#e7a3c4'),
 'oscuro': dict(tallo='#4d6640', hoja='#5f7a4b', flor='#d8d2e2', lavanda='#8a72b8', sombrero='#8a73a8', sombrero2='#8f7f66',
                pie='#b9ad9b', lunar='#c9bdd6', ala='#9c86cc', vestido='#6f8f55', pelo='#8a6040', piel='#d9bba1',
                polvo='#e6c15a', mar1='#9c86cc', mar2='#c98aa8'),
}
MARIPOSAS = {
 'claro': dict(tallo='#6d8a6a', hoja='#a3bf95', flor='#ffffff', lavanda='#9aa7e0', ala='#9fb3ec', vestido='#e58fb2',
               pelo='#c9924a', piel='#f3d6bf', polvo='#dcae36', mar1='#8fa2e8', mar2='#f0a3c0', mar3='#f2cf6b'),
 'oscuro': dict(tallo='#4c604c', hoja='#5d7657', flor='#cfd6e6', lavanda='#6f7cb8', ala='#8095d6', vestido='#c77595',
                pelo='#a8783c', piel='#d9bba5', polvo='#e8c35a', mar1='#7d8fd6', mar2='#c97d99', mar3='#c9a94f'),
}
CAMPANITAS = {
 'claro': dict(tallo='#4f8069', hoja='#8fbca4', flor='#ffffff', sombrero='#e6a3b4', pie='#f5ede2', lunar='#fff6f8',
               ala='#8fd0c6', vestido='#e58fa8', vestido2='#7fb7d9', pelo='#b27a3c', pelo2='#6b4a30', piel='#f3d6bf',
               polvo='#d6aa35'),
 'oscuro': dict(tallo='#3d6152', hoja='#4f7766', flor='#d6e6e2', sombrero='#a8707e', pie='#b7aea2', lunar='#d9cfd2',
                ala='#6fb3a9', vestido='#c07888', vestido2='#6897b5', pelo='#94663a', pelo2='#6b4a30', piel='#d6b9a2',
                polvo='#e6c15a'),
}

def bloque(nombre, marcos, trama, pal, modo, o_marco, o_trama):
    global CURRENT
    CURRENT = nombre
    der, izq, arriba = marcos(pal[modo], o_marco)
    return f"""  --textura:
    {der},
    {izq},
    {arriba},
    {trama(pal[modo], o_trama)};"""

POS = """  /* El marco va pegado a las esquinas de la pantalla, como en los dibujos:
     lo grande abajo a la derecha, lejos de la sidebar, y en el celular por
     encima de la tab bar y debajo de la cabecera. La última capa, la única que se repite, es el polvo
     del fondo. */
  --textura-tamano: min(56vw, 250px) auto, min(38vw, 170px) auto, min(36vw, 160px) auto, var(--trama);
  --textura-posicion: right bottom var(--sobre-tab-bar), left bottom var(--sobre-tab-bar), right top var(--bajo-cabecera), 0 0;
  --textura-repetir: no-repeat, no-repeat, no-repeat, repeat;"""

# One file per theme. Old SVGs go first: with the hash in the name, a drawing
# that changed would otherwise leave the previous file orphaned.
for theme in ('hongo', 'mariposas', 'campanitas'):
    for old in TEXTURES.glob(f'{theme}-*.svg'):
        old.unlink()
TEXTURES.mkdir(parents=True, exist_ok=True)

css = f"""
html[data-tema='hongo'] {{
  /* El hada sentada en un hongo lila, entre helechos y lavanda. */
  --fondo: #f2ecf3;
  --superficie: #fdfafd;
  --superficie-alta: #ffffff;
  --tinta: #27212c;
  --tinta-suave: #594f62;
  --acento: #7b4a8e;
  --sobre-acento: #ffffff;
  --acento-suave: #e9dcef;
  --borde: #e3d7e8;
  --estrella-vacia: #d6c8dd;
  --radio: 1.125rem;

  --durazno: #8a5e0e;
  --menta: #3d6e2f;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--font-lora), Georgia, serif;
  --tipo-titulo: var(--font-chewy), cursive;
  --tipo-cartel: var(--font-chewy), cursive;
  --titulo-peso: 400;
  --borde-ancho: 2px;
  --borde-estilo: dotted;
  --cartel-escala: 0.72;

{bloque('hongo', hongo_marcos, hongo_trama, HONGO, 'claro', .9, .55)}
  --trama: 300px 300px;
{POS}

  --sombra-baja: 0 1px 2px rgb(60 30 70 / 0.06), 0 2px 6px rgb(60 30 70 / 0.05);
  --sombra-alta: 0 2px 4px rgb(60 30 70 / 0.06), 0 14px 32px -10px rgb(60 30 70 / 0.26);
}}

html.dark[data-tema='hongo'] {{
  --fondo: #16121a;
  --superficie: #201a26;
  --superficie-alta: #29222f;
  --tinta: #f2ecf5;
  --tinta-suave: #b5a9bf;
  --acento: #cfa3e0;
  --sobre-acento: #16121a;
  --acento-suave: #35283d;
  --borde: #332a3a;
  --estrella-vacia: #43384b;

  --durazno: #e9c46a;
  --menta: #9ccf85;
  --sobre-persona: #16121a;

{bloque('hongo', hongo_marcos, hongo_trama, HONGO, 'oscuro', .6, .5)}
}}

html[data-tema='mariposas'] {{
  /* Un hada volando con su estela de polvo, y mariposas por toda la hoja. */
  --fondo: #edf2f8;
  --superficie: #fbfcfe;
  --superficie-alta: #ffffff;
  --tinta: #1f2533;
  --tinta-suave: #4d566b;
  --acento: #4a5bb0;
  --sobre-acento: #ffffff;
  --acento-suave: #dde3f5;
  --borde: #d9e0ec;
  --estrella-vacia: #c6cfe0;
  --radio: 1.25rem;

  --durazno: #8a5e0e;
  --menta: #a8456a;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--font-lora), Georgia, serif;
  --tipo-titulo: var(--font-comfortaa), sans-serif;
  --tipo-cartel: var(--font-comfortaa), sans-serif;
  --titulo-peso: 700;
  --titulo-espaciado: 0.03em;
  --cartel-escala: 0.54;

{bloque('mariposas', mariposas_marcos, mariposas_trama, MARIPOSAS, 'claro', .9, .45)}
  --trama: 320px 320px;
{POS}

  --sombra-baja: 0 1px 2px rgb(30 40 80 / 0.05), 0 2px 6px rgb(30 40 80 / 0.04);
  --sombra-alta: 0 2px 4px rgb(30 40 80 / 0.05), 0 14px 32px -10px rgb(30 40 80 / 0.22);
}}

html.dark[data-tema='mariposas'] {{
  --fondo: #11141c;
  --superficie: #1a1e29;
  --superficie-alta: #232836;
  --tinta: #edf1f8;
  --tinta-suave: #a8b0c4;
  --acento: #a3b1f2;
  --sobre-acento: #11141c;
  --acento-suave: #262c45;
  --borde: #2a3040;
  --estrella-vacia: #373e52;

  --durazno: #efc26b;
  --menta: #f09bb8;
  --sobre-persona: #11141c;

{bloque('mariposas', mariposas_marcos, mariposas_trama, MARIPOSAS, 'oscuro', .6, .4)}
}}

html[data-tema='campanitas'] {{
  /* Lirios del valle altos como árboles para dos hadas: una en un hongo, otra
     volando entre las flores. */
  --fondo: #e9f3f1;
  --superficie: #fbfdfd;
  --superficie-alta: #ffffff;
  --tinta: #1d2a28;
  --tinta-suave: #4a5c59;
  --acento: #23706b;
  --sobre-acento: #ffffff;
  --acento-suave: #d3ebe6;
  --borde: #d1e4e0;
  --estrella-vacia: #bcd6d1;
  --radio: 1rem;

  --durazno: #8a5e0e;
  --menta: #a8456a;
  --sobre-persona: #ffffff;

  --tipo-cita: var(--font-lora), Georgia, serif;
  --tipo-titulo: var(--font-mali), cursive;
  --tipo-cartel: var(--font-mali), cursive;
  --titulo-peso: 700;
  --borde-ancho: 2px;
  --cartel-escala: 0.62;

{bloque('campanitas', campanitas_marcos, campanitas_trama, CAMPANITAS, 'claro', .9, .55)}
  --trama: 280px 280px;
{POS}

  --sombra-baja: 0 1px 2px rgb(20 60 55 / 0.06), 0 2px 6px rgb(20 60 55 / 0.05);
  --sombra-alta: 0 2px 4px rgb(20 60 55 / 0.06), 0 14px 32px -10px rgb(20 60 55 / 0.24);
}}

html.dark[data-tema='campanitas'] {{
  --fondo: #0f1817;
  --superficie: #172321;
  --superficie-alta: #1f2d2b;
  --tinta: #eaf5f3;
  --tinta-suave: #a3bab6;
  --acento: #7fd1c6;
  --sobre-acento: #0f1817;
  --acento-suave: #1d3835;
  --borde: #263835;
  --estrella-vacia: #334744;

  --durazno: #efc26b;
  --menta: #f09bb8;
  --sobre-persona: #0f1817;

{bloque('campanitas', campanitas_marcos, campanitas_trama, CAMPANITAS, 'oscuro', .6, .5)}
}}
"""

# The f-string above already wrote the SVGs. Now the CSS, split by theme.
for theme in ('hongo', 'mariposas', 'campanitas'):
    start = css.index(f"html[data-tema='{theme}']")
    end = css.index('}', css.index(f"html.dark[data-tema='{theme}']")) + 1
    pathlib.Path(f'styles/themes/{theme}.ts').write_text(f"export default /* css */ `\n{css[start:end]}\n`;\n")
