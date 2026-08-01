# CLAUDE.md — blender-proj-01

## Šta je ovaj projekat
Blender projekat kojim upravlja agent iz Claude Code-a. Scena živi u `scenes/projekat.blend`,
Python moduli u `scripts/`, izlaz u `renders/` i `exports/`. Agent ne dira Blender GUI rukama —
sve ide kroz Blender MCP tool-ove nad ŽIVOM, otvorenom Blender sesijom.

## Okruženje (verifikovano u živoj sesiji)
- Blender **5.1.1**, branch `blender-v5.1-release`, Python **3.13.9**, Windows 11.
- `bpy.app.background == False` — Blender je otvoren i Jovan gleda u njega.
- Otvoreni fajl: `C:\Users\admin\BlenderProjects\blender-proj-01\scenes\projekat.blend`
- Render engine: `BLENDER_EEVEE`; `view_settings.view_transform = 'AgX'`, display device `sRGB`.
- MCP server se zove **Blender**. Puno ime tool-a zavisi od toga kako je server povezan
  (`mcp__Blender__<tool>` kada je server konfigurisan lokalno; `mcp__remote-devices__Blender__<tool>`
  samo u remote Cowork sesiji gde ide preko remote-devices bridge-a).
  Dole pišem tool-ove bez prefiksa — koristi ono ime koje ti klijent prikazuje.
- Kod iz MCP-a se izvršava sa `context.area is None` i `context.space_data is None`;
  `context.window`, `context.screen` ("Layout"), `context.view_layer`, `context.mode` postoje.

## Struktura foldera
```
scenes/            radni .blend fajlovi (projekat.blend je glavni)
scenes/_versions/  ručni snapshot-ovi projekat_v003.blend
scripts/           Python moduli koje agent import-uje u živi Blender
scripts/lib/       čiste, reusable funkcije, bez side-efekata na import
scripts/ops/       one-shot skripte koje menjaju scenu
assets/models/     linked/appended .blend biblioteke
assets/textures/   slike, uvek referencirane relativno (//assets/textures/...)
assets/hdri/       environment mape
refs/              reference i moodboard, ne ulaze u render
renders/           IZLAZ renderovanja — nikad se ne commit-uje
exports/           .glb/.fbx/.obj izlaz — nikad se ne commit-uje
cache/             sim bake, point cache — nikad se ne commit-uje
```
Ovo je ciljni raspored. Ne svaki folder mora već postojati na disku — pre upisa proveri da li
folder postoji i napravi ga ako ne postoji, umesto da pretpostaviš putanju.

## Kako se radi sa Blenderom — uzmi najjeftiniji tool koji odgovara na pitanje
1. **Šta je u sceni?** → `get_objects_summary` (bez argumenata). Vraća scenu, aktivni objekat,
   `object_mode`, kameru i stablo kolekcija sa objektima. Nikad ne piši `execute_blender_code`
   samo da bi izlistao objekte.
2. **Detalji jednog objekta?** → `get_object_detail_summary(name)` — location/rotation/scale,
   dimensions, parent, children, modifiers, constraints, materials, visibility.
3. **Da li je snimljeno / gde živi fajl?** → `get_blendfile_summary_path_info`
   (`filepath`, `is_saved`, `is_dirty`, `age_seconds`, `backups`).
   **Pozovi ovo pre svake mutacije.** Ako je `is_dirty == true`, javi Jovanu pre izmene.
4. **Brojevi datablokova / engine / workspace-ovi?** → `get_blendfile_summary_datablocks`.
5. **Polomljene putanje** → `get_blendfile_summary_missing_files`;
   linkovane biblioteke → `get_blendfile_summary_of_linked_libraries`;
   nepoznat nasleđen fajl → `get_blendfile_summary_usage_guess`.
6. **Treba ti API istina pre pisanja koda** → `search_api_docs(query, ...)` pa
   `get_python_api_docs(identifier)` za celu stranicu (`bpy.*` ili trailing `*` nabraja decu).
   Ne izmišljaj imena property-ja — 5.1 je dosta preimenovao.
7. **Kako korisnik radi X u UI-ju?** → `search_manual_docs`.
8. **Stanje UI-ja bez piksela** → `get_screenshot_of_window_as_json`.
9. **Moraš stvarno videti geometriju** → `render_thumbnail_to_path(output_path)` — mali,
   low-quality render sa privremeno oborenim postavkama; to je jedina jeftina opcija za feedback petlju.
   `render_viewport_to_path(output_path)` uprkos imenu radi PUN render scene sa trenutnim render
   postavkama (blokira živi Blender) — koristi ga samo kad Jovan izričito traži render.
   Uvek u `renders\`, pa pročitaj PNG.
10. **Pikseli jednog editora** → `get_screenshot_of_area_as_image(area_ui_type, size_limit_in_bytes)`;
    `get_screenshot_of_window_as_image` je poslednja opcija.
11. **Usmeri Jovanov viewport** → `jump_to_view3d_object_by_name(name, allow_edits=false)`,
    `jump_to_view3d_object_data_by_name`, `jump_to_tab_by_name`, `jump_to_tab_by_space_type`.
    Drži `allow_edits=false` osim ako je tražio suprotno.
12. **Sve ostalo (mutacije, bulk upiti)** → `execute_blender_code`.

## execute_blender_code — ugovor
- Kod se `exec`-uje u svežem namespace-u, `bpy` je dostupan. **Dodeli dict promenljivoj `result`.**
- Uspeh: `{"status":"ok","result":{...}}`. Bez `result` → `{"status":"ok","result":{}}`.
- Neserijalizabilne vrednosti se pretvaraju u repr, ne odbacuju se:
  `{"obj": bpy.data.objects["Cube"]}` → `{"obj":"bpy.data.objects['Cube']"}`.
  Vraćaj `.name`, brojeve i liste — nikad bpy strukture, `Vector` ili `set`.
- `print()` se hvata u `stdout` ključ.
- Izuzetak → `{"status":"error","message":"<traceback>"}` i **delimične izmene ostaju primenjene**.
  Zato: idempotentan kod, `try/except` oko rizičnog dela, pa provera sa `get_objects_summary`.
- Batch-uj: jedan skript koji vraća jedan `result`, umesto deset sitnih poziva.

## Live vs `_for_cli`
`*_for_cli` varijante pokreću `blender --background` nad zadatim `blend_file` — **drugi proces**.
Koristi ih samo za fajlove koji NISU otvoreni (arhivirana scena, batch export).
Nikad `_for_cli` nad `scenes/projekat.blend` dok je otvoren: čitaš stanje sa diska (nesnimljen rad
je nevidljiv), a snimanje iz pozadine bi pregazilo Jovanov nesnimljen rad.

## Blender 5.1 API — zamke (sve verifikovano uživo)
**Engine**
- Validne vrednosti `scene.render.engine`: `BLENDER_EEVEE`, `BLENDER_WORKBENCH`, `CYCLES`.
  `BLENDER_EEVEE_NEXT` i golo `EEVEE` ne postoje.
- Ne validiraj engine preko `enum_items` — vraća samo `['BLENDER_EEVEE']`, ni Workbench ni
  Cycles se ne pojavljuju. Dodeli string u `try/except`; poruka greške izlistava pravi skup
  `('BLENDER_EEVEE', 'BLENDER_WORKBENCH', 'CYCLES')`.

**EEVEE (5.x)**
- NE POSTOJE: `eevee.use_bloom`, `use_ssr`, `use_gtao`, `use_motion_blur`.
- Postoje: `use_raytracing`, `ray_tracing_method`, `use_shadows`, `shadow_ray_count`,
  `shadow_step_count`, `use_fast_gi`, `taa_samples` (viewport), `taa_render_samples` (final),
  `use_overscan`, `clamp_surface_indirect`, `use_volumetric_shadows`.
- Detalji ray-tracinga: `eevee.ray_tracing_options.*` (`resolution_scale`, `use_denoise`, ...).
- Motion blur je `scene.render.use_motion_blur`. Bloom se danas radi Glare nodom u kompozitoru.

**Kompozitor**
- `scene.node_tree` je **UKLONJEN**. Novo: `scene.compositing_node_group` (`NodeTree | None`).
- Node property-ji su prešli u input sockete. `CompositorNodeGlare` nema `glare_type`; ima
  `inputs["Type"]` tipa `NodeSocketMenu` čije su vrednosti **labeli**:
  `'Bloom','Ghosts','Streaks','Fog Glow','Simple Star','Sun Beams','Kernel'`.
- `NodeSocketMenu ... enum_items` je prazna lista — introspekcija ne radi; validne vrednosti
  izvuci iz poruke greške pri namernoj pogrešnoj dodeli.

**Node grupe i materijali**
- `node_group.inputs` / `.outputs` ne postoje. Koristi
  `node_group.interface.new_socket(name=..., in_out='INPUT', socket_type='NodeSocketGeometry')`.
- Principled BSDF NEMA `"Specular"`, `"Emission"`, `"Subsurface"`, `"Transmission"`. IMA:
  `"Base Color"`, `"Metallic"`, `"Roughness"`, `"IOR"`, `"Alpha"`, `"Specular IOR Level"`,
  `"Emission Color"`, `"Emission Strength"`, `"Subsurface Weight"`, `"Transmission Weight"`,
  `"Coat Weight"`, `"Sheen Weight"`, `"Diffuse Roughness"`, `"Thin Film Thickness"`, `"Thin Film IOR"`.

**Svetla i boje**
- `light.energy` nepromenjeno (Point default 1000 W). Novo: `normalize`, `exposure`,
  `temperature` (6500.0), `use_temperature`, `transmission_factor`.
- `view_settings.view_transform` je dinamičan enum: `enum_items` vraća samo `['NONE']`, ali
  dodela `'AgX'` / `'Standard'` / `'Filmic'` radi.
- Color space imena: `sRGB`, `Non-Color`, `ACEScg`, `AgX Base sRGB`, `Linear Rec.709`, `scene_linear`.

**Šta i dalje radi** — klasični operatori (`mesh.primitive_*_add`, `object.light_add/camera_add/
join/duplicate/delete/convert/transform_apply/shade_smooth/modifier_add`, `wm.save_as_mainfile`),
`select_set/select_get`, `view_layer.objects.active`, `scene.collection.objects.link/unlink`,
`bmesh`, `mesh.from_pydata`, `evaluated_depsgraph_get`, `modifiers.new(...,'SUBSURF')`.
Shade-smooth je danas boolean atribut `sharp_face` po face-u.

**Kontekst iz MCP-a**
- `bpy.ops.view3d.*` puca sa `poll() failed` — potreban `context.temp_override`:
```python
import bpy
for w in bpy.context.window_manager.windows:
    for a in w.screen.areas:
        if a.type == 'VIEW_3D':
            r = next(r for r in a.regions if r.type == 'WINDOW')
            with bpy.context.temp_override(window=w, area=a, region=r):
                bpy.ops.view3d.snap_cursor_to_center()
```
- `bpy.ops.mesh.primitive_cube_add()`, `object.mode_set(...)`, `object.select_all()` prolaze bez override-a.
- Preferiraj direktni data API (`obj.location`, `bmesh`, `bpy.data.*.new`) nad operatorima.

## Pravila / DON'Ts
- Ne ostavljaj Blender u Edit Mode-u, sa promenjenom selekcijom ili na drugom workspace-u:
  zapamti `object_mode` i `active_object` pre, vrati posle.
- Ne pozivaj `bpy.ops.wm.save_mainfile()` preko `scenes/projekat.blend` bez pitanja — snimaj
  varijante u `scenes/` ili `scenes/_versions/`.
- Ne pokreći pun render sinhrono. `render_thumbnail_to_path` za feedback petlju; `render.render`
  i `render_viewport_to_path` samo kad Jovan traži, uvek u `renders/`.
- Ne pozivaj `get_screenshot_of_window_as_image` u petlji — skup je.
- Ne pogađaj imena API-ja; `search_api_docs` košta jedan poziv.
- Ne koristi apsolutne `C:\...` putanje u sceni — posle dodavanja teksture pozovi
  `bpy.ops.file.make_paths_relative()` (ili File > External Data > Make Paths Relative).
- Ne oslanjaj se na `Automatically Pack Resources`; naduva .blend i čini repozitorijum
  neupotrebljivim za git.

## Workflow
1. `get_blendfile_summary_path_info` → proveri `is_dirty` pre bilo kakve izmene.
2. `get_objects_summary` → snimi polazno stanje (mode, aktivni objekat, selekcija).
3. Izmene kroz jedan batch-ovan `execute_blender_code`, idempotentno, sa `result` dict-om.
4. Verifikuj rezultat sumarnim tool-om, ne novim screenshot-om.
5. `render_thumbnail_to_path` u `renders\` kad treba vizuelna potvrda.
6. Vrati polazno stanje UI-ja, pa javi Jovanu šta je promenjeno i predloži snimanje.

### scripts/ i reload
Agent radi `sys.path.insert(0, r"C:\Users\admin\BlenderProjects\blender-proj-01\scripts")`.
Python kešira module u `sys.modules`, pa druga izmena fajla neće imati efekta — `bootstrap.py`
mora da obriše sve ključeve sa prefiksom projekta iz `sys.modules` pa da re-import-uje.
Moduli u `lib/` moraju biti bez side-efekata na import (sve u funkcijama).
