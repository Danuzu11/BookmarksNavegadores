import fs from 'fs';

const htmlContent = fs.readFileSync('bookmarks_31_03_26.html', 'utf8');

function parseBookmarks(html) {
    const bookmarks = [];
    const categories = new Set();
    
    // Simple state-based parsing for Netscape Bookmark files
    const lines = html.split('\n');
    let currentCategory = 'Uncategorized';
    
    // Stack to track nested folders
    const categoryStack = ['Barra de favoritos'];

    for (let line of lines) {
        line = line.trim();
        
        // Check for category start <DT><H3 ...>CategoryName</H3>
        const h3Match = line.match(/<H3[^>]*>(.*?)<\/H3>/i);
        if (h3Match) {
            currentCategory = h3Match[1].trim();
            categories.add(currentCategory);
            categoryStack.push(currentCategory);
            continue;
        }
        
        // Check for folder close </DL>
        if (line.includes('</DL>')) {
            categoryStack.pop();
            currentCategory = categoryStack[categoryStack.length - 1] || 'Uncategorized';
        }
        
        // Check for links <DT><A HREF="(.*?)"[^>]*>(.*?)</A>
        const aMatch = line.match(/<A HREF="(.*?)"[^>]*>(.*?)<\/A>/i);
        if (aMatch) {
            const url = aMatch[1];
            const title = aMatch[2];
            bookmarks.push({
                id: Math.random().toString(36).substring(2, 11),
                title: title.trim(),
                url: url,
                category: currentCategory,
                description: '',
                icon: '' // We could extract ADD_DATE or ICON data here if needed
            });
        }
    }
    
    return {
        categories: Array.from(categories),
        bookmarks: bookmarks
    };
}

const data = parseBookmarks(htmlContent);
fs.writeFileSync('src/initial_data.json', JSON.stringify(data, null, 2));
console.log(`Parsed ${data.bookmarks.length} bookmarks across ${data.categories.length} categories.`);
