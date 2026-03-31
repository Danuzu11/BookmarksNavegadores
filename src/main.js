// Icons mapping based on typical categories (you can expand this)
const ICON_MAP = {
    'Work': 'work_outline',
    'Entertainment': 'theaters',
    'News': 'newspaper',
    'Personal': 'person_2',
    'Development': 'terminal',
    'Design': 'palette',
    'Hostings': 'cloud_queue',
    'APIS': 'api',
    'IA': 'smart_toy',
    'default': 'bookmark'
};

const BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID;
const MASTER_KEY = import.meta.env.VITE_JSONBIN_MASTER_KEY;
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

let state = {
    bookmarks: [],
    categories: [],
    currentCategory: 'all',
    searchQuery: '',
    loading: true
};

// --- API Services ---

async function fetchCollection() {
    try {
        const response = await fetch(API_URL, {
            headers: { 'X-Master-Key': MASTER_KEY }
        });
        const result = await response.json();
        // Result structure: { record: { categories: [], bookmarks: [] } }
        return result.record;
    } catch (err) {
        console.error('Failed to fetch from JSONBin:', err);
        return null;
    }
}

async function updateCollection(data) {
    setStatus('Archiving changes...');
    try {
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify(data)
        });
        setStatus('Preserved in cloud.');
        setTimeout(() => setStatus(''), 3000);
        return response.ok;
    } catch (err) {
        console.error('Failed to update JSONBin:', err);
        setStatus('Error preservation failed.');
        return false;
    }
}

// --- UI Logic ---

function setStatus(msg) {
    const el = document.getElementById('status-indicator');
    if (el) el.textContent = msg;
}

function renderCategories() {
    const list = document.getElementById('category-list');
    const existing = list.querySelectorAll('[data-category]');
    
    // Clear dynamic categories (keep "All Archives")
    existing.forEach(el => {
        if (el.dataset.category !== 'all') el.remove();
    });

    state.categories.sort().forEach(cat => {
        const icon = ICON_MAP[cat] || ICON_MAP['default'];
        const a = document.createElement('a');
        a.className = `flex items-center gap-4 text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-surface-container-high hover:text-primary pl-6 py-3 transition-all text-sm font-medium tracking-wide cursor-pointer ${state.currentCategory === cat ? 'border-l-2 border-primary !opacity-100 !text-on-surface' : ''}`;
        a.href = '#';
        a.dataset.category = cat;
        a.innerHTML = `
            <span class="material-symbols-outlined">${icon}</span>
            <span>${cat}</span>
        `;
        a.onclick = (e) => {
            e.preventDefault();
            state.currentCategory = cat;
            renderCategories();
            renderBookmarks();
        };
        list.appendChild(a);
    });

    // Update "All Archives" active state
    const allBtn = list.querySelector('[data-category="all"]');
    if (state.currentCategory === 'all') {
        allBtn.classList.add('border-l-2', 'border-primary', '!opacity-100', '!text-on-surface');
    } else {
        allBtn.classList.remove('border-l-2', 'border-primary', '!opacity-100', '!text-on-surface');
    }
}

function renderBookmarks() {
    const grid = document.getElementById('bookmark-grid');
    grid.innerHTML = '';

    const filtered = state.bookmarks.filter(b => {
        const matchesCat = state.currentCategory === 'all' || b.category === state.currentCategory;
        const matchesSearch = b.title.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
                             b.url.toLowerCase().includes(state.searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-20 text-on-surface-variant">No manuscripts found in this collection.</div>`;
        return;
    }

    filtered.forEach(b => {
        const card = document.createElement('div');
        const icon = ICON_MAP[b.category] || ICON_MAP['default'];
        card.className = "group relative bg-surface-container-lowest p-6 rounded-lg transition-all duration-300 hover:bg-surface-container-highest hover:translate-y-[-4px]";
        card.innerHTML = `
            <div class="absolute inset-0 border border-primary/0 group-hover:border-primary/20 rounded-lg transition-all pointer-events-none"></div>
            <div class="flex justify-between items-start mb-6">
                <div class="w-12 h-12 bg-surface-variant flex items-center justify-center rounded">
                    <span class="material-symbols-outlined text-primary">${icon}</span>
                </div>
                <div class="flex flex-col items-end">
                    <span class="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold">${b.category}</span>
                    <button class="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-error text-xs delete-btn" data-id="${b.id}">Delete</button>
                </div>
            </div>
            <h3 class="title-md font-bold text-on-surface mb-2 truncate" title="${b.title}">${b.title}</h3>
            <p class="text-sm text-on-surface-variant mb-6 line-clamp-2">${b.description || 'No description provided.'}</p>
            <a class="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all" href="${b.url}" target="_blank">
                ${new URL(b.url).hostname}
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
        `;
        
        card.querySelector('.delete-btn').onclick = async () => {
            if (confirm('Are you sure you want to remove this manuscript from the archive?')) {
                state.bookmarks = state.bookmarks.filter(item => item.id !== b.id);
                await updateCollection({ categories: state.categories, bookmarks: state.bookmarks });
                renderBookmarks();
            }
        };

        grid.appendChild(card);
    });

    // Update Header Text
    document.getElementById('current-category-title').textContent = 
        state.currentCategory === 'all' ? 'The Permanent Collection' : state.currentCategory;
}

// --- App Initialization ---

async function init() {
    setStatus('Synchronizing library...');
    const data = await fetchCollection();
    
    if (data && data.bookmarks) {
        state.bookmarks = data.bookmarks;
        state.categories = data.categories || [];
        setStatus('Ready.');
    } else {
        setStatus('Library is empty.');
        state.bookmarks = [];
    }
    
    renderCategories();
    renderBookmarks();

    // Event Listeners
    document.querySelector('[data-category="all"]').onclick = (e) => {
        e.preventDefault();
        state.currentCategory = 'all';
        renderCategories();
        renderBookmarks();
    };

    document.getElementById('search-input').oninput = (e) => {
        state.searchQuery = e.target.value;
        renderBookmarks();
    };

    // Modal logic
    const modal = document.getElementById('bookmark-modal');
    document.getElementById('add-bookmark-btn').onclick = () => {
        modal.classList.remove('hidden');
        populateDatalist();
    };
    
    document.getElementById('close-modal').onclick = () => {
        modal.classList.add('hidden');
    };

    document.getElementById('bookmark-form').onsubmit = async (e) => {
        e.preventDefault();
        const newBookmark = {
            id: Math.random().toString(36).substring(2, 11),
            title: document.getElementById('form-title').value,
            url: document.getElementById('form-url').value,
            category: document.getElementById('form-category').value,
            description: ''
        };

        state.bookmarks.unshift(newBookmark);
        if (!state.categories.includes(newBookmark.category)) {
            state.categories.push(newBookmark.category);
        }

        await updateCollection({ categories: state.categories, bookmarks: state.bookmarks });
        modal.classList.add('hidden');
        renderCategories();
        renderBookmarks();
        document.getElementById('bookmark-form').reset();
    };

    // Data Upload Logic
    document.getElementById('upload-data-btn').onclick = async () => {
        if (confirm('This will overwrite current cloud data with the local bookmarks file. Proceed?')) {
            try {
                const response = await fetch('/initial_data.json');
                const initialData = await response.json();
                
                state.bookmarks = initialData.bookmarks;
                state.categories = initialData.categories;
                
                await updateCollection({ categories: state.categories, bookmarks: state.bookmarks });
                renderCategories();
                renderBookmarks();
                alert('Library successfully migrated to cloud.');
            } catch (err) {
                console.error(err);
                alert('Migration failed. Ensure src/initial_data.json exists.');
            }
        }
    };
}

function populateDatalist() {
    const dl = document.getElementById('category-options');
    dl.innerHTML = '';
    state.categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        dl.appendChild(opt);
    });
}

init();
