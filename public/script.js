/**
 * FINAL PRODUCTION CONTROLLER
 * Features: Auto-Mapping Data, Robust Error Handling, Instant UI
 */
const API_URL = 'http://localhost:3000/api';

const App = {
    state: {
        students: [],
        currentRole: 'admin',
        theme: 'dark',
        currentPage: 1,
        itemsPerPage: 10,
        sort: { key: 'name', dir: 'asc' },
        filter: '',
        selected: new Set(),
        depts: ["Computer Science", "Electrical", "Mechanical", "Civil", "Architecture", "Aeronautical", "IT", "Business", "Biomedical", "Communications"]
    },

    async init() {
        console.log("🚀 Application Starting...");
        UI.init(); // Draw the empty table first

        // Load Settings
        const sets = JSON.parse(localStorage.getItem('edu_settings'));
        if (sets) { App.state.currentRole = sets.role; App.state.theme = sets.theme; UI.applyTheme(); UI.updateAuth(); }
        
        await App.fetchData();
    },

    async fetchData() {
        try {
            const res = await fetch(`${API_URL}/students`);
            if (!res.ok) throw new Error(`Server Error: ${res.status}`);
            
            const rawData = await res.json();
            
            // --- DATA MAPPING FIX ---
            // This ensures we handle 'average_marks' (SQL) vs 'averageMarks' (JS) automatically
            App.state.students = rawData.map(s => ({
                id: s.id,
                name: s.name,
                registration_number: s.registration_number || s.registrationNumber, // Check both
                department: s.department,
                blood_group: s.blood_group || s.bloodGroup, // Check both
                year: s.year,
                average_marks: s.average_marks || s.averageMarks // Check both
            }));

            console.log(`✅ Loaded ${App.state.students.length} students`);
            
            if (App.state.students.length === 0) {
                alert("Database connected but returned 0 students. Did you run the SQL file?");
            }

            UI.renderAll();
        } catch (e) { 
            console.error("CRITICAL FETCH ERROR:", e);
            document.getElementById('table-body').innerHTML = `
                <tr><td colspan="8" style="text-align:center; padding: 2rem; color: #ef233c;">
                    <strong>❌ Error Loading Data</strong><br>
                    <small>${e.message}</small>
                </td></tr>`;
        }
    },

    getProcessedData() {
        let data = [...App.state.students];
        
        // --- SEARCH LOGIC UPDATED ---
        if (App.state.filter) {
            const t = App.state.filter.toLowerCase();
            data = data.filter(s => 
                (s.name && s.name.toLowerCase().includes(t)) || 
                (s.registration_number && s.registration_number.toLowerCase().includes(t)) || 
                (s.blood_group && s.blood_group.toLowerCase().includes(t)) ||
                (s.department && s.department.toLowerCase().includes(t)) // <--- ADDED DEPT SEARCH
            );
        }
        
        data.sort((a, b) => {
            const key = App.state.sort.key; 
            const valA = (a[key] !== undefined && a[key] !== null) ? a[key].toString().toLowerCase() : '';
            const valB = (b[key] !== undefined && b[key] !== null) ? b[key].toString().toLowerCase() : '';
            return App.state.sort.dir === 'asc' ? valA.localeCompare(valB, undefined, {numeric: true}) : valB.localeCompare(valA, undefined, {numeric: true});
        });
        return data;
    },

    async saveStudent(e) {
        e.preventDefault();
        
        const submitBtn = document.querySelector('#student-form button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Saving...";
        submitBtn.disabled = true;

        const data = {
            id: document.getElementById('inp-id').value || App.uuid(),
            name: document.getElementById('inp-name').value,
            registration_number: document.getElementById('inp-reg').value,
            department: document.getElementById('inp-dept').value,
            blood_group: document.getElementById('inp-blood').value,
            year: document.getElementById('inp-year').value,
            average_marks: document.getElementById('inp-marks').value
        };

        const method = document.getElementById('inp-id').value ? 'PUT' : 'POST';
        const url = method === 'PUT' ? `${API_URL}/students/${data.id}` : `${API_URL}/students`;
        
        try {
            const res = await fetch(url, { 
                method, 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify(data) 
            });

            const result = await res.json();

            if (!res.ok) {
                // SERVER REJECTED IT (e.g., Duplicate Reg No)
                throw new Error(result.error || "Failed to save student");
            }

            // SUCCESS
            document.getElementById('student-modal').classList.add('hidden');
            alert("✅ Student Saved Successfully!");
            await App.fetchData(); // Refresh the table
            
        } catch (error) {
            console.error(error);
            alert(`❌ Error: ${error.message}\n(Hint: Registration Numbers must be unique!)`);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    },

    async deleteStudent(id) {
        if (!confirm('Delete this student?')) return;
        await fetch(`${API_URL}/students/${id}`, { method: 'DELETE' });
        App.fetchData();
    },

    async bulkDelete() {
        if (!confirm(`Delete ${App.state.selected.size} students?`)) return;
        for (let id of App.state.selected) await fetch(`${API_URL}/students/${id}`, { method: 'DELETE' });
        App.state.selected.clear();
        App.fetchData();
    },

    uuid: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => (Math.random()*16|0).toString(16))
};

const UI = {
    init() {
        UI.bindEvents();
        UI.popDepts();
    },

    applyTheme() { document.body.className = App.state.theme === 'light' ? 'light-mode' : 'dark-mode'; },
    
    popDepts() {
        const sel = document.getElementById('inp-dept');
        if(!sel) return;
        sel.innerHTML = '';
        App.state.depts.forEach(d => sel.innerHTML += `<option value="${d}">${d}</option>`);
    },

    renderAll() {
        UI.updateAuth();
        const processed = App.getProcessedData();
        const start = (App.state.currentPage - 1) * App.state.itemsPerPage;
        const pageData = processed.slice(start, start + App.state.itemsPerPage);
        
        UI.renderTable(pageData);
        UI.renderPagination(processed.length);
        UI.renderStats(processed);
        UI.renderCharts(processed);
        UI.renderTopPerformers(processed);
    },

    renderTable(data) {
        const tbody = document.getElementById('table-body');
        if(!tbody) return;
        tbody.innerHTML = '';
        if(!data.length) { tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem">No Data Found</td></tr>`; return; }

        data.forEach(s => {
            const tr = document.createElement('tr');
            const isSel = App.state.selected.has(s.id);
            const check = App.state.currentRole === 'admin' ? `<input type="checkbox" class="row-chk" value="${s.id}" ${isSel?'checked':''}>` : '';
            const actions = App.state.currentRole === 'admin' ? 
                `<button class="icon-btn edit-btn" data-id="${s.id}"><i class="fa-solid fa-pen"></i></button>
                 <button class="icon-btn del-btn" style="color:var(--danger)" data-id="${s.id}"><i class="fa-solid fa-trash"></i></button>` : '';

            // SAFE RENDERING: Checks if value exists before printing
            tr.innerHTML = `
                <td class="role-admin-only">${check}</td>
                <td><strong>${s.name || 'Unknown'}</strong></td>
                <td>${s.registration_number || 'N/A'}</td>
                <td>${s.department || 'N/A'}</td>
                <td style="color:var(--danger);font-weight:bold">${s.blood_group || '-'}</td>
                <td>${s.year || 1}</td>
                <td>${s.average_marks || 0}%</td>
                <td>${actions}</td>`;
            
            tr.querySelector('.edit-btn')?.addEventListener('click', (e) => { e.stopPropagation(); UI.edit(s.id); });
            tr.querySelector('.del-btn')?.addEventListener('click', (e) => { e.stopPropagation(); App.deleteStudent(s.id); });
            tr.addEventListener('click', e => { if(e.target.type!=='checkbox' && !e.target.closest('button')) UI.openProfile(s); });
            tbody.appendChild(tr);
        });

        // Rebind Checkboxes
        document.querySelectorAll('.row-chk').forEach(c => c.addEventListener('change', e => {
            e.target.checked ? App.state.selected.add(e.target.value) : App.state.selected.delete(e.target.value);
            UI.updateBulkBtn();
        }));
    },
    
    renderTopPerformers(data) {
        const tbody = document.getElementById('top-performers-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        const top5 = [...data].sort((a,b) => (b.average_marks||0) - (a.average_marks||0)).slice(0, 5);
        
        top5.forEach(s => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${s.name}</strong></td>
                    <td>${s.department}</td>
                    <td><span class="badge" style="background:rgba(56, 176, 0, 0.2);color:#38b000">${s.average_marks}%</span></td>
                </tr>
            `;
        });
    },

    updateBulkBtn() {
        const btn = document.getElementById('bulk-delete-btn');
        const count = document.getElementById('sel-count');
        if(App.state.selected.size > 0 && App.state.currentRole === 'admin') {
            btn.classList.remove('hidden'); count.textContent = App.state.selected.size;
        } else btn.classList.add('hidden');
    },

    renderPagination(total) {
        const pages = Math.ceil(total / App.state.itemsPerPage) || 1;
        document.getElementById('page-info').textContent = `Page ${App.state.currentPage} of ${pages}`;
        document.getElementById('prev-page').disabled = App.state.currentPage === 1;
        document.getElementById('next-page').disabled = App.state.currentPage >= pages;
    },

    renderStats(data) {
        const avg = data.length ? (data.reduce((a,b)=>a+(b.average_marks||0),0)/data.length).toFixed(1) : 0;
        if(document.getElementById('header-total')) document.getElementById('header-total').textContent = data.length;
        if(document.getElementById('dash-total')) document.getElementById('dash-total').textContent = data.length;
        if(document.getElementById('dash-avg')) document.getElementById('dash-avg').textContent = avg + '%';
        if(document.getElementById('dash-depts')) document.getElementById('dash-depts').textContent = new Set(data.map(s=>s.department)).size;
    },

    renderCharts(data) {
        // 1. Logic for "Students per Dept" & "Students per Year" (Uses ALL data)
        const depts = {}, years = {};
        
        // 2. Logic for "Avg Marks" (Uses FILTERED data based on dropdown)
        const yearFilter = document.getElementById('report-year-filter')?.value || 'all';
        const avgMarksData = {}; // To store list of marks per dept
        
        data.forEach(s => {
            // Standard Counts
            const d = s.department || 'Unknown';
            const y = s.year || 'Unknown';
            depts[d] = (depts[d]||0)+1;
            years[y] = (years[y]||0)+1;

            // Average Logic: Check Year Filter
            // If filter is 'all', allow everyone. If not, match the year.
            if (yearFilter === 'all' || s.year.toString() === yearFilter) {
                if(!avgMarksData[d]) avgMarksData[d] = [];
                avgMarksData[d].push(parseFloat(s.average_marks));
            }
        });

        // Calculate Averages from the filtered list
        const avgs = {}; 
        for(let k in avgMarksData) {
            const total = avgMarksData[k].reduce((a,b) => a+b, 0);
            avgs[k] = (total / avgMarksData[k].length).toFixed(1);
        }

        // 3. Drawing Helper
        const draw = (id, obj) => {
            const div = document.getElementById(id); 
            if(!div) return;
            div.innerHTML='';
            
            // If filtered data is empty (e.g., no students in Year 4 for a specific dept)
            if(Object.keys(obj).length === 0) {
                div.innerHTML = `<div style="text-align:center; padding:20px; color:#888;">No Data for Year ${yearFilter}</div>`;
                return;
            }

            const max = Math.max(...Object.values(obj), 1);
            for(let k in obj) {
                div.innerHTML += `<div class="bar-row">
                    <div class="bar-label">${k.slice(0,10)}..</div>
                    <div class="bar-track"><div class="bar-fill" style="width:${(obj[k]/max)*100}%"></div></div>
                    <div class="badge">${obj[k]}</div>
                </div>`;
            }
        };

        draw('chart-dept', depts); 
        draw('chart-avg', avgs); 
        draw('chart-year', years);
    },

    openProfile(s) {
        document.getElementById('view-name').textContent = s.name;
        document.getElementById('view-reg').textContent = s.registration_number;
        document.getElementById('view-dept').textContent = s.department;
        document.getElementById('view-blood').textContent = s.blood_group;
        document.getElementById('view-year').textContent = s.year;
        document.getElementById('view-marks').textContent = s.average_marks + '%';
        document.getElementById('profile-modal').classList.remove('hidden');
    },

    edit(id) {
        const s = App.state.students.find(x => x.id === id);
        document.getElementById('inp-id').value = s.id;
        document.getElementById('inp-name').value = s.name;
        document.getElementById('inp-reg').value = s.registration_number;
        document.getElementById('inp-dept').value = s.department;
        document.getElementById('inp-blood').value = s.blood_group;
        document.getElementById('inp-year').value = s.year;
        document.getElementById('inp-marks').value = s.average_marks;
        document.getElementById('student-modal').classList.remove('hidden');
    },

    updateAuth() {
        const isAdmin = App.state.currentRole === 'admin';
        document.getElementById('role-display').textContent = isAdmin ? 'Admin' : 'Viewer';
        document.getElementById('role-select').value = App.state.currentRole;
        document.querySelectorAll('.role-admin-only').forEach(e => {
            e.style.display = isAdmin ? (e.tagName==='TD'?'table-cell':'inline-block') : 'none';
        });
    },

    bindEvents() {
        // Navigation
        document.querySelectorAll('.menu-item').forEach(b => {
            b.addEventListener('click', () => {
                document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active')); b.classList.add('active');
                document.querySelectorAll('.view-section').forEach(s => { s.classList.remove('active'); s.classList.add('hidden'); });
                const section = document.getElementById(b.dataset.target);
                if(section) { section.classList.remove('hidden'); section.classList.add('active'); }
            });
        });

        // Search & Filters
        document.getElementById('search-input')?.addEventListener('keyup', e => { App.state.filter = e.target.value; App.state.currentPage=1; UI.renderAll(); });
        
        // NEW: Report Year Filter Listener
        document.getElementById('report-year-filter')?.addEventListener('change', () => {
            // Re-render only the charts when year changes
            UI.renderCharts(App.getProcessedData());
        });

        // Pagination & Modals
        document.getElementById('prev-page')?.addEventListener('click', () => { App.state.currentPage--; UI.renderAll(); });
        document.getElementById('next-page')?.addEventListener('click', () => { App.state.currentPage++; UI.renderAll(); });
        document.getElementById('add-btn')?.addEventListener('click', () => { document.getElementById('student-form').reset(); document.getElementById('inp-id').value=''; document.getElementById('student-modal').classList.remove('hidden'); });
        document.querySelectorAll('.close-modal').forEach(b => b.addEventListener('click', () => document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'))));
        document.getElementById('student-form')?.addEventListener('submit', App.saveStudent);
        
        // Settings & Toggles
        const toggle = () => document.querySelector('.sidebar').classList.toggle('open');
        document.getElementById('sidebar-toggle')?.addEventListener('click', toggle);
        document.getElementById('close-sidebar')?.addEventListener('click', toggle);
        document.getElementById('theme-toggle')?.addEventListener('click', () => { App.state.theme = App.state.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('edu_settings', JSON.stringify({role: App.state.currentRole, theme: App.state.theme})); UI.applyTheme(); });
        document.getElementById('role-select')?.addEventListener('change', e => { App.state.currentRole = e.target.value; localStorage.setItem('edu_settings', JSON.stringify({role: App.state.currentRole, theme: App.state.theme})); UI.renderAll(); });
        document.getElementById('reset-db-btn')?.addEventListener('click', async () => { if(confirm('Reset DB?')) { await fetch(`${API_URL}/reset`, {method:'POST'}); App.fetchData(); } });
        document.getElementById('bulk-delete-btn')?.addEventListener('click', App.bulkDelete);
        document.getElementById('export-csv')?.addEventListener('click', () => {
            const rows = [['Name','Reg','Dept','Blood','Year','Marks'], ...App.getProcessedData().map(s => [s.name,s.registration_number,s.department,s.blood_group,s.year,s.average_marks])];
            const csv = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
            const link = document.createElement("a"); link.href = encodeURI(csv); link.download = "students.csv"; link.click();
        });
    }
};

document.addEventListener('DOMContentLoaded', App.init);