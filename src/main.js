import './style.css';

// Icons mapping based on typical categories
const ICON_MAP = {
    'General Library': 'library_books',
    'Hosting & Infrastructure': 'cloud_queue',
    'Education & Courses': 'school',
    'Developer Tools': 'build',
    'API Resources': 'api',
    'Artificial Intelligence': 'auto_awesome',
    'Design & Styling': 'palette',
    'Vector & ML': 'hub',
    'Thesis & OMR': 'history_edu',
    'Ula Pulse Project': 'monitoring',
    'UI Dashboards & Templates': 'dashboard',
    'Game Design & Assets': 'sports_esports',
    'Entertainment & Games': 'videogame_asset',
    'Academic & SQL': 'history_edu',
    'Background Research': 'fact_check',
    'Hackaton': 'event',
    'default': 'bookmark'
};

const BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID;
const API_KEY = import.meta.env.VITE_JSONBIN_API_KEY;
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

let state = {
    bookmarks: [],
    categories: [],
    currentCategory: 'all',
    searchQuery: '',
    loading: true,
    editingId: null
};

// --- API Services ---


async function fetchCollection() {
    setStatus('Synchronizing with cloud archive...');
    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'X-Access-Key': `${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        console.log('API Fetch Response:', result);

        // Safely extract data with fallbacks
        const record = result.record || {};
        state.bookmarks = Array.isArray(record.bookmarks) ? record.bookmarks : [];
        state.categories = Array.isArray(record.categories) ? record.categories : [];

        if (state.bookmarks.length > 0) {
            setStatus('Ready.');
        } else {
            setStatus('Archive is empty - start adding manuscripts!');
        }

        return record;
    } catch (err) {
        console.error('Failed to fetch from JSONBin:', err);
        setStatus('Connection error.');
    }
}

async function updateCollection(data) {
    setStatus('Preserving changes in cloud...');
    try {
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Key': `${API_KEY}`,
            },
            body: JSON.stringify(data)
        });
        setStatus('Collection preserved.');
        setTimeout(() => setStatus('Ready.'), 3000);
        return response.ok;
    } catch (err) {
        console.error('Failed to update JSONBin:', err);
        setStatus('Preservation failed.');
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

    existing.forEach(el => {
        if (el.dataset.category !== 'all') el.remove();
    });

    state.categories.sort().forEach(cat => {
        const icon = ICON_MAP[cat] || ICON_MAP['default'];
        const a = document.createElement('a');
        a.className = `flex items-center gap-4 text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-surface-container-high hover:text-primary pl-6 py-3 transition-all text-sm font-medium tracking-wide cursor-pointer ${state.currentCategory === cat ? 'border-l-2 border-primary !opacity-100 !text-on-surface bg-surface-container-high/40' : ''}`;
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

    const allBtn = list.querySelector('[data-category="all"]');
    if (state.currentCategory === 'all') {
        allBtn.classList.add('border-l-2', 'border-primary', '!opacity-100', '!text-on-surface', 'bg-surface-container-high/40');
    } else {
        allBtn.classList.remove('border-l-2', 'border-primary', '!opacity-100', '!text-on-surface', 'bg-surface-container-high/40');
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
        grid.innerHTML = `<div class="col-span-full text-center py-20 text-on-surface-variant">Selected archive is empty.</div>`;
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
                    <div class="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="text-on-surface-variant hover:text-primary text-xs edit-btn" data-id="${b.id}">Edit</button>
                        <button class="text-on-surface-variant hover:text-error text-xs delete-btn" data-id="${b.id}">Delete</button>
                    </div>
                </div>
            </div>
            <h3 class="title-md font-bold text-on-surface mb-2 truncate" title="${b.title}">${b.title}</h3>
            <p class="text-sm text-on-surface-variant mb-6 line-clamp-2">${b.description || b.url.substring(0, 50) + '...'}</p>
            <a class="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all" href="${b.url}" target="_blank">
                ${new URL(b.url).hostname}
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
        `;

        card.querySelector('.edit-btn').onclick = () => {
            openModal(b);
        };

        card.querySelector('.delete-btn').onclick = async () => {
            if (confirm('Permanently remove this manuscript from the collection?')) {
                state.bookmarks = state.bookmarks.filter(item => item.id !== b.id);
                await updateCollection({ categories: state.categories, bookmarks: state.bookmarks });
                renderBookmarks();
            }
        };

        grid.appendChild(card);
    });

    document.getElementById('current-category-title').textContent =
        state.currentCategory === 'all' ? 'The Permanent Collection' : state.currentCategory;
}

// --- App Initialization ---

async function init() {
    // 1. Fetch from cloud immediately
    const data = await fetchCollection();
    console.log('State:', data);

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

    document.getElementById('refresh-btn').onclick = async () => {
        await fetchCollection();
        renderCategories();
        renderBookmarks();
    };

    // Modal logic
    const modal = document.getElementById('bookmark-modal');

    document.getElementById('add-bookmark-btn').onclick = () => {
        openModal();
    };

    document.getElementById('add-category-btn').onclick = () => {
        const name = prompt('Enter the name of the new collection:');
        if (name && !state.categories.includes(name)) {
            state.categories.push(name);
            updateCollection({ categories: state.categories, bookmarks: state.bookmarks });
            renderCategories();
        }
    };

    document.getElementById('close-modal').onclick = () => {
        closeModal();
    };

    document.getElementById('bookmark-form').onsubmit = async (e) => {
        e.preventDefault();

        const bookmarkData = {
            title: document.getElementById('form-title').value,
            url: document.getElementById('form-url').value,
            category: document.getElementById('form-category').value,
            description: ''
        };

        if (state.editingId) {
            // Update existing
            const index = state.bookmarks.findIndex(b => b.id === state.editingId);
            if (index !== -1) {
                state.bookmarks[index] = { ...state.bookmarks[index], ...bookmarkData };
            }
        } else {
            // Add new
            const newBookmark = {
                id: Math.random().toString(36).substring(2, 11),
                ...bookmarkData
            };
            state.bookmarks.unshift(newBookmark);
        }

        if (!state.categories.includes(bookmarkData.category)) {
            state.categories.push(bookmarkData.category);
        }

        await updateCollection({ categories: state.categories, bookmarks: state.bookmarks });
        closeModal();
        renderCategories();
        renderBookmarks();
    };

    // Improved Data Import Logic
    document.getElementById('upload-data-btn').onclick = async () => {
        if (confirm('Overwrite cloud archive with local JSON data? This cannot be undone.')) {
            try {
                const response = await fetch('initial_data.json');
                const initialData = await response.json();

                state.bookmarks = initialData.bookmarks;
                state.categories = initialData.categories;

                await updateCollection({ categories: state.categories, bookmarks: state.bookmarks });
                renderCategories();
                renderBookmarks();
                alert('Success: Archive updated with local data.');
            } catch (err) {
                console.error(err);
                alert('Import failed. Please ensure the local build is correct.');
            }
        }
    };
}

function openModal(bookmark = null) {
    const modal = document.getElementById('bookmark-modal');
    const titleEl = document.getElementById('modal-title');
    const form = document.getElementById('bookmark-form');

    state.editingId = bookmark ? bookmark.id : null;
    titleEl.textContent = bookmark ? 'Update Archive Record' : 'Archive New Manuscript';

    if (bookmark) {
        document.getElementById('form-title').value = bookmark.title;
        document.getElementById('form-url').value = bookmark.url;
        document.getElementById('form-category').value = bookmark.category;
    } else {
        form.reset();
    }

    modal.classList.remove('hidden');
    populateDatalist();
}

function closeModal() {
    const modal = document.getElementById('bookmark-modal');
    modal.classList.add('hidden');
    state.editingId = null;
    document.getElementById('bookmark-form').reset();
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
