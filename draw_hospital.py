import json
import uuid

def generate_id():
    return str(uuid.uuid4())

class ExcalidrawGenerator:
    def __init__(self, filename):
        self.filename = filename
        self.elements = []
        self.colors = {
            "GRAY":   ("#2b2b2b", "#868e96", "#f8f9fa"),
            "GREEN":  ("#1a3b22", "#51cf66", "#d3f9d8"),
            "BLUE":   ("#1a263b", "#4dabf7", "#d0ebff"),
            "PURPLE": ("#2b1a3b", "#cc5de8", "#eebefa"),
            "RED":    ("#3b1a1a", "#ff6b6b", "#ffc9c9"),
            "ORANGE": ("#3b2a1a", "#ff922b", "#ffe8cc"),
            "TRANSPARENT": ("transparent", "#868e96", "#f8f9fa")
        }

    def add_rect(self, x, y, width, height, bg_color="#2b2b2b", stroke_color="#868e96", stroke_style="solid", opacity=100):
        rect_id = generate_id()
        self.elements.append({
            "id": rect_id,
            "type": "rectangle",
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "angle": 0,
            "strokeColor": stroke_color,
            "backgroundColor": bg_color,
            "fillStyle": "solid" if bg_color != "transparent" else "hachure",
            "strokeWidth": 2,
            "strokeStyle": stroke_style,
            "roughness": 1,
            "opacity": opacity,
            "roundness": {"type": 3},
            "boundElements": []
        })
        return rect_id

    def add_text(self, x, y, text, container_id=None, font_size=20, color="#ffffff", w=None, h=None, align="center"):
        text_id = generate_id()
        lines = text.split('\n')
        max_len = max([len(line) for line in lines])
        width = w if w else max_len * (font_size * 0.6)
        height = h if h else len(lines) * font_size * 1.5
        
        elem = {
            "id": text_id,
            "type": "text",
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "angle": 0,
            "strokeColor": color,
            "backgroundColor": "transparent",
            "fillStyle": "hachure",
            "strokeWidth": 1,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "text": text,
            "fontSize": font_size,
            "fontFamily": 5,
            "textAlign": align,
            "verticalAlign": "middle",
            "baseline": font_size - 4
        }
        
        if container_id:
            elem["containerId"] = container_id
            for e in self.elements:
                if e["id"] == container_id:
                    if "boundElements" not in e or e["boundElements"] is None:
                        e["boundElements"] = []
                    e["boundElements"].append({"id": text_id, "type": "text"})
                    elem["x"] = e["x"] + e["width"]/2 - width/2
                    elem["y"] = e["y"] + e["height"]/2 - height/2
                    break
                    
        self.elements.append(elem)
        return text_id

    def create_box(self, x, y, w, h, text, theme="GRAY", stroke_style="solid", font_size=18, align="center"):
        bg, stroke, text_color = self.colors.get(theme, self.colors["GRAY"])
        box_id = self.add_rect(x, y, w, h, bg, stroke, stroke_style)
        if text:
            self.add_text(x, y, text, container_id=box_id, color=text_color, font_size=font_size, align=align)
        return box_id

    def add_arrow(self, start_id, end_id, label=None, color="#868e96", side="bottom", stroke_style="solid", pt_offset=None):
        start_el = next(e for e in self.elements if e["id"] == start_id)
        end_el = next(e for e in self.elements if e["id"] == end_id)
        
        if side == "bottom":
            sx = start_el["x"] + start_el["width"] / 2
            sy = start_el["y"] + start_el["height"]
            ex = end_el["x"] + end_el["width"] / 2
            ey = end_el["y"]
        elif side == "right":
            sx = start_el["x"] + start_el["width"]
            sy = start_el["y"] + start_el["height"] / 2
            ex = end_el["x"]
            ey = end_el["y"] + end_el["height"] / 2
        elif side == "left":
            sx = start_el["x"]
            sy = start_el["y"] + start_el["height"] / 2
            ex = end_el["x"] + end_el["width"]
            ey = end_el["y"] + end_el["height"] / 2
        elif side == "top":
            sx = start_el["x"] + start_el["width"] / 2
            sy = start_el["y"]
            ex = end_el["x"] + end_el["width"] / 2
            ey = end_el["y"] + end_el["height"]
        else: # center to center
            sx = start_el["x"] + start_el["width"] / 2
            sy = start_el["y"] + start_el["height"] / 2
            ex = end_el["x"] + end_el["width"] / 2
            ey = end_el["y"] + end_el["height"] / 2

        points = [[0, 0]]
        if pt_offset:
            for pt in pt_offset:
                points.append(pt)
        points.append([ex - sx, ey - sy])

        arrow_id = generate_id()
        arrow = {
            "id": arrow_id,
            "type": "arrow",
            "x": sx,
            "y": sy,
            "width": abs(ex - sx) or 1,
            "height": abs(ey - sy) or 1,
            "angle": 0,
            "strokeColor": color,
            "backgroundColor": "transparent",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": stroke_style,
            "roughness": 1,
            "opacity": 100,
            "startBinding": {"elementId": start_id, "focus": 0, "gap": 5},
            "endBinding": {"elementId": end_id, "focus": 0, "gap": 5},
            "startArrowhead": None,
            "endArrowhead": "arrow",
            "points": points
        }
        self.elements.append(arrow)
        
        if label:
            lx = sx + (ex - sx)/2
            ly = sy + (ey - sy)/2 - 10
            self.add_text(lx, ly, label, color="#d0ebff", font_size=16)

        return arrow_id

    def save(self):
        excalidraw_json = {
          "type": "excalidraw",
          "version": 2,
          "source": "https://excalidraw.com",
          "elements": self.elements,
          "appState": {
            "viewBackgroundColor": "#121212",
            "theme": "dark",
            "gridSize": 20
          },
          "files": {}
        }
        with open(self.filename, "w", encoding="utf-8") as f:
            json.dump(excalidraw_json, f, indent=2, ensure_ascii=False)
        print(f"Generated {self.filename}")


def generate_architecture():
    gen = ExcalidrawGenerator("architecture_overview.excalidraw")
    
    bw = 280
    bh = 80
    gap_x = 40
    gap_y = 120
    
    # Layer 1: Client
    y = 50
    gen.create_box(50, y-30, 4*bw + 3*gap_x + 40, bh + 70, "Client Layer", "TRANSPARENT", stroke_style="dashed")
    a_id = gen.create_box(70, y+10, bw, bh, "🏥 Staff Dashboard\n(Doctors, Nurses, Receptionists)", "BLUE")
    b_id = gen.create_box(70 + bw + gap_x, y+10, bw, bh, "⚙️ Admin Panel\n(Administrators)", "PURPLE")
    c_id = gen.create_box(70 + 2*(bw + gap_x), y+10, bw, bh, "🏠 Patient Portal\n(Self-service)", "GREEN")
    d_id = gen.create_box(70 + 3*(bw + gap_x), y+10, bw, bh, "🌐 Public Website\n(Booking & Information)", "ORANGE")
    
    # Layer 2: Infrastructure
    y += gap_y + bh
    gen.create_box(70 + bw + gap_x - 20, y-30, 2*bw + gap_x + 40, bh + 70, "Infrastructure", "TRANSPARENT", stroke_style="dashed")
    n_id = gen.create_box(70 + bw + gap_x, y+10, bw, bh, "🔀 Nginx\n(Reverse Proxy)", "ORANGE")
    f_id = gen.create_box(70 + 2*(bw + gap_x), y+10, bw, bh, "⚛️ Next.js 16\n(App Router)", "GRAY")
    
    # Layer 3: API Gateway
    y += gap_y + bh
    gen.create_box(70 + bw + gap_x - 20, y-30, 2*bw + gap_x + 40, bh + 70, "API Gateway", "TRANSPARENT", stroke_style="dashed")
    g_id = gen.create_box(70 + bw + gap_x, y+10, bw, bh, "🔐 Spring Security + JWT\n(RBAC · Rate Limiting · CORS)", "RED")
    h_id = gen.create_box(70 + 2*(bw + gap_x), y+10, bw, bh, "🔌 REST Controllers\n(118 endpoints · 32 controllers)", "RED")
    
    # Layer 4: Application Core
    y += gap_y + bh
    gen.create_box(70 + 1.5*(bw + gap_x) - bw/2 - 20, y-30, bw + 40, 3*bh + 2*gap_y/2 + 60, "Application Core\nDDD Modular Monolith", "TRANSPARENT", stroke_style="dashed")
    i_id = gen.create_box(70 + 1.5*(bw + gap_x) - bw/2, y+20, bw, bh, "📦 Application Services\n(Use Cases · Workflows · Auth)", "BLUE")
    j_id = gen.create_box(70 + 1.5*(bw + gap_x) - bw/2, y+20 + bh + gap_y/2, bw, bh, "🏛️ Domain Model\n(Entities · Value Objects)", "BLUE")
    k_id = gen.create_box(70 + 1.5*(bw + gap_x) - bw/2, y+20 + 2*bh + 2*gap_y/2, bw, bh, "🗄️ Infrastructure\n(Spring Data JPA · PostgreSQL)", "GRAY")
    
    # Layer 5: Data & Observability
    y += 3*bh + 2*gap_y/2 + gap_y
    gen.create_box(70 + 0.5*(bw + gap_x) - 20, y-30, 3*bw + 2*gap_x + 40, bh + 70, "Data & Observability", "TRANSPARENT", stroke_style="dashed")
    l_id = gen.create_box(70 + 0.5*(bw + gap_x), y+10, bw, bh, "🐘 PostgreSQL 15\n(pgvector · 35 tables)", "BLUE")
    m_id = gen.create_box(70 + 1.5*(bw + gap_x), y+10, bw, bh, "📊 Prometheus → Grafana\n(Metrics & Dashboards)", "ORANGE")
    o_id = gen.create_box(70 + 2.5*(bw + gap_x), y+10, bw, bh, "📝 Loki → Tempo\n(Logs & Traces)", "ORANGE")

    # Arrows
    gen.add_arrow(a_id, n_id)
    gen.add_arrow(b_id, n_id)
    gen.add_arrow(c_id, n_id)
    gen.add_arrow(d_id, n_id)
    
    gen.add_arrow(n_id, f_id, side="right")
    
    gen.add_arrow(f_id, g_id)
    gen.add_arrow(g_id, h_id, side="right")
    
    gen.add_arrow(h_id, i_id)
    
    gen.add_arrow(i_id, j_id)
    gen.add_arrow(j_id, k_id)
    gen.add_arrow(k_id, l_id)
    
    gen.add_arrow(h_id, m_id, stroke_style="dashed")
    gen.add_arrow(h_id, o_id, stroke_style="dashed")
    
    gen.save()


def generate_workflow():
    gen = ExcalidrawGenerator("clinical_workflow.excalidraw")
    
    bw = 250
    bh = 80
    gap_x = 100
    gap_y = 60
    
    # Left to Right flow
    x = 50
    y = 200
    
    # 1. Booking
    gen.create_box(x-20, y-40, bw+40, bh+80, "1️⃣ Booking", "TRANSPARENT", stroke_style="dashed")
    p1 = gen.create_box(x, y, bw, bh, "🧑 Patient\n(Books online)", "GREEN")
    
    x += bw + gap_x
    # 2. Intake & Queue
    gen.create_box(x-20, y-40, bw+40, 2*bh+gap_y+80, "2️⃣ Intake & Queue", "TRANSPARENT", stroke_style="dashed")
    r1 = gen.create_box(x, y, bw, bh, "👩‍💼 Receptionist\n(Check-in · Register Queue)", "BLUE")
    n1 = gen.create_box(x, y+bh+gap_y, bw, bh, "👩‍⚕️ Nurse\n(Vital Signs · Room Assign)", "BLUE")
    
    x += bw + gap_x
    # 3. Consultation
    gen.create_box(x-20, y-40, bw+40, 2*bh+gap_y+80, "3️⃣ Consultation", "TRANSPARENT", stroke_style="dashed")
    d1 = gen.create_box(x, y+(bh+gap_y)/2, bw, bh+20, "👨‍⚕️ Doctor\n(Examination · Diagnosis\nE-Prescription · PDF Export)", "PURPLE")
    
    x += bw + gap_x
    # 4. Pharmacy & Billing (Parallel)
    gen.create_box(x-20, y-40, bw+40, bh+80, "4️⃣ Pharmacy", "TRANSPARENT", stroke_style="dashed")
    ph = gen.create_box(x, y, bw, bh, "💊 Pharmacist\n(Dispense · Lot Tracking)", "ORANGE")
    
    gen.create_box(x-20, y+bh+gap_y-40, bw+40, bh+80, "5️⃣ Billing", "TRANSPARENT", stroke_style="dashed")
    ac = gen.create_box(x, y+bh+gap_y, bw, bh, "💰 Accountant\n(Invoice · Payment)", "RED")
    
    x += bw + gap_x
    # 6. Completion
    gen.create_box(x-20, y-40, bw+40, 2*bh+gap_y+80, "6️⃣ Completion", "TRANSPARENT", stroke_style="dashed")
    out = gen.create_box(x, y+(bh+gap_y)/2, bw, bh, "✅ Patient\n(Receives meds & invoice)", "GREEN")
    
    # Arrows
    gen.add_arrow(p1, r1, "1. Book Appointment", side="right")
    gen.add_arrow(r1, n1, "2. Check-in", side="bottom")
    gen.add_arrow(n1, d1, "3. Vitals Recorded", side="right")
    gen.add_arrow(d1, ph, "4. E-Prescription", side="right")
    gen.add_arrow(d1, ac, "5. Services Billed", side="right")
    gen.add_arrow(ph, out, "6. Meds Dispensed", side="right")
    gen.add_arrow(ac, out, "7. Payment", side="right")
    
    gen.save()


if __name__ == "__main__":
    generate_architecture()
    generate_workflow()
