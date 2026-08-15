/**
 * Šejder ekrana u 3D vitrini projekata.
 *
 * Jedan snimak izlazi, sledeći ulazi, preko cele ravni - i to na sva četiri
 * uređaja u istom kadru. Sinhronizacija se NE postiže ovde nego time što sva
 * četiri materijala dele jedan tween koji im upisuje `uProgress` i `uDir`
 * (`ProjectDeviceScene.tsx`); ovaj fajl samo mora da bude tačan za bilo koju
 * vrednost tog para.
 *
 * Konvencija je `heroCube.shaders.ts`: obični template string, `<shaderMaterial>`
 * u JSX-u, uniforme se pišu imperativno kroz ref.
 */

export const screenSlideVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const screenSlideFragmentShader = /* glsl */ `
uniform sampler2D uCurr;
uniform sampler2D uNext;

uniform float uCurrAspect;   // širina / visina snimka
uniform float uNextAspect;
uniform float uPlaneAspect;  // širina / visina OVE ravni ekrana

uniform float uProgress;     // 0 .. 1
uniform float uDir;          // +1 napred, -1 nazad

uniform float uSheen;
uniform vec3 uSheenColor;

/**
 * 1 kad je gore na ekranu \`v = 1\`, 0 kad je \`v = 0\`.
 *
 * Dva izvora geometrije, dve konvencije. \`PlaneGeometry\` pravljena u kodu daje
 * gornjem vrhu \`uv.v = 1\`; ekrani iz glTF-a, sa \`flipY = false\` kako ih i
 * \`DisciplineModel\` koristi, imaju \`v = 0\` na vrhu. Uniforma umesto \`#define\`
 * jer nema dohvata teksture u grananju - samo jedan \`mix\` nad koordinatom - pa
 * ne treba drugi program.
 */
uniform float uFlipV;

#ifdef HAS_VIDEO
uniform sampler2D uVideo;
uniform float uVideoAspect;
uniform float uVideoMix;     // 0 .. 1
#endif

varying vec2 vUv;

// DEKLARACIJE ZA ČANKOVE NA DNU main()-a, i nisu opcione.
//
// Lanac je \`<common>\` -> \`rand()\` -> \`<dithering_pars_fragment>\` -> \`dithering()\`,
// koji \`<dithering_fragment>\` samo POZIVA. Fali li ijedna karika, fragment šejder
// ne kompajlira, program pada, i četiri ekrana ostaju crna - bez ijedne poruke
// koja bi ličila na problem sa teksturama. Svaki ugrađeni three materijal
// uključuje \`<common>\`; ručno pisan mora sam.
//
// \`tonemapping_pars\` stoji iz istog razloga: dok je \`toneMapped: false\` njegov
// parnjak se širi u ništa, ali onog dana kad se AgX vrati na ekrane, vratiće se
// kao zastavica a ne kao još jedan crn ekran.
#include <common>
#include <tonemapping_pars_fragment>
#include <dithering_pars_fragment>

/**
 * \`object-fit: cover; object-position: top center\`, u jednoj funkciji.
 *
 * \`p\` je u DOM prostoru: (0,0) je GORNJI LEVI ugao ravni i y raste naniže. To je
 * ceo razlog zašto je \`flipY\` isključen na ovim teksturama - time sidro na vrhu
 * postaje bukvalno \`o.y = 0.0\` umesto izraza koji se lako napiše naopako, a
 * snimak usidren za futer umesto za hero izgleda uverljivo i prođe kroz pregled.
 */
vec2 coverTop(vec2 p, float imgAspect) {
  float k = imgAspect / uPlaneAspect;
  // k < 1: snimak je relativno viši - puna širina, kropuje se dno. Ovo je slučaj
  //        za sva 24 mockapa.
  // k > 1: snimak je relativno širi - puna visina, kropuju se obe strane.
  vec2 s = vec2(min(1.0 / k, 1.0), min(k, 1.0));
  vec2 o = vec2((1.0 - s.x) * 0.5, 0.0);
  return p * s + o;
}

void main() {
  // GL-ov v raste naviše, a redovi snimka naniže, i \`flipY\` je isključen
  // (vidi \`prepareMockupTexture\`). Jedan flip ovde stavlja ostatak šejdera u DOM
  // prostor i tu ga drži.
  vec2 duv = vec2(vUv.x, mix(vUv.y, 1.0 - vUv.y, uFlipV));

  // GURANJE. uDir = +1 znači da trenutni snimak odlazi ULEVO a sledeći dolazi
  // ZDESNA. Dve koordinate se razlikuju za tačno jednu širinu ravni, pa je u
  // svakom trenutku tačno jedna od njih na ravni.
  float cx = duv.x + uProgress * uDir;
  float nx = cx - uDir;

  // ŠAV, po ekranskom x, umesto testa opsega nad cx.
  //
  // Test opsega je inkluzivan na jednom kraju a ekskluzivan na drugom, i koji je
  // koji obrće se sa uDir - pa na tačno p=0 ili tačno p=1 ostavlja kolonu od
  // jednog teksela pogrešnog snimka uz jednu ivicu, i to samo u jednom smeru. To
  // je greška koja se nađe na screenshot-u šest meseci kasnije.
  float forward = 0.5 + 0.5 * uDir;                    // tačno 1.0 ili 0.0
  float seam = mix(uProgress, 1.0 - uProgress, forward);
  float showNext = mix(step(duv.x, seam), step(seam, duv.x), forward);

  // Klampuje se PRE sempliranja. Obe grane \`mix\`-a se uvek izvršavaju, pa se i
  // ona koju ćemo odbaciti semplira sa x van opsega - a njen izvod preko šava bi
  // izabrao grub mip, tj. mutnu kolonu tačno tamo gde se dva snimka spajaju.
  vec2 cuv = clamp(coverTop(vec2(cx, duv.y), uCurrAspect), 0.0, 1.0);
  vec2 nuv = clamp(coverTop(vec2(nx, duv.y), uNextAspect), 0.0, 1.0);

  // Upload je SRGB8_ALPHA8, pa hardver dekodira: sve ispod je linearno.
  vec3 color = mix(texture2D(uCurr, cuv).rgb, texture2D(uNext, nuv).rgb, showNext);

#ifdef HAS_VIDEO
  // Semplira se na NEPOMERENOJ koordinati i drži na nuli kroz ceo slajd, pa klip
  // ne može da otputuje iz jednog projekta u snimak drugog.
  vec2 vuv = clamp(coverTop(duv, uVideoAspect), 0.0, 1.0);
  color = mix(color, texture2D(uVideo, vuv).rgb, uVideoMix);
#endif

  // Nagoveštaj stakla. Ekrani su namerno bez osvetljenja - osenčen snimak je
  // nečitljiv snimak - pa ovo stoji umesto jedine stvari koju bi im svetlo dalo:
  // odsjaja koji kaže da panel ima površinu.
  float sheen = smoothstep(0.55, 0.0, duv.x + duv.y * 0.6);
  color += uSheenColor * sheen * uSheen;

  gl_FragColor = vec4(color, 1.0);

  // Kompajlira se u ništa dok je \`toneMapped\` false, a jeste: AgX je podešen za
  // kućišta, a snimak propušten kroz njega vraća se kao ugašena verzija tuđeg
  // brenda. Ostaje u izvoru da vraćanje bude zastavica a ne izmena.
  #include <tonemapping_fragment>
  // NIJE opciono. Canvas je \`outputColorSpace: SRGBColorSpace\`, pa bi se bez ovoga
  // linearne vrednosti odozgo upisale pravo u sRGB bafer i svaki snimak bi
  // renderovao vidno tamno.
  #include <colorspace_fragment>
  #include <dithering_fragment>
}
`;
