import editorParser from 'editorjs-parser'

const customParsers = {
    paragraph: function(data:{ text?: string; alignment?: string; }) {
        const { text = '', alignment = 'left' } = data;
        return `<p style="text-align: ${alignment};">${text}</p>`;
    },
    image: function(data: { file?: any; caption?: any; stretched?: any; withBorder?: any; withBackground?: any; }, config: any) {
        const {
            file = {},
            caption = '',
            stretched = false,
            withBorder = false,
            withBackground = false
        } = data;
        
        const alignment = 'center';
        
        let imageHtml = `<img src="${file.url}" alt="${caption}" style="width: 100%; height: auto; display: block;`;
        
        if (stretched) {
            imageHtml += ' object-fit: cover;';
        }
        
        if (withBorder) {
            imageHtml += ' border: 2px solid #e5e7eb; border-radius: 0.5rem;';
        }
        
        if (withBackground) {
            imageHtml += ' padding: 1rem; background-color: #f5f5f5; border-radius: 0.5rem;';
        }
        
        imageHtml += '" />';
        
        let figureHtml = `<figure style="text-align: ${alignment}; margin: 1.5rem 0;`;
        
        if (withBackground) {
            figureHtml += ' background-color: #f5f5f5; padding: 1rem; border-radius: 0.5rem;';
        }
        
        figureHtml += `">${imageHtml}`;
        
        if (caption) {
            figureHtml += `<figcaption style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem; font-style: italic;">${caption}</figcaption>`;
        }
        
        figureHtml += '</figure>';
        
        return figureHtml;
    },
    list: function(data: { style?: string; items?: any[]; meta?: any }, config: any) {
        const { style = 'unordered', items = [], meta = {} } = data;
        const alignment = 'left';
        
        const renderListItems = (listItems: any[], listStyle: string): string => {
            return listItems.map(item => {
                let html = '';
                
                if (listStyle === 'checklist') {
                    const isChecked = item.meta?.checked || false;
                    const checkboxHtml = isChecked 
                        ? '<input type="checkbox" checked disabled style="margin-right: 0.5rem;" />'
                        : '<input type="checkbox" disabled style="margin-right: 0.5rem;" />';
                    html = `<li style="color: #141216; margin-bottom: 0.5rem; line-height: 1.625; display: flex; align-items: center;">${checkboxHtml}<span>${item.content || ''}</span>`;
                } else {
                    html = `<li style="color: #141216; margin-bottom: 0.5rem; line-height: 1.625;">${item.content || ''}`;
                }
                
                if (item.items && item.items.length > 0) {
                    html += renderList(item.items, listStyle);
                }
                
                html += '</li>';
                return html;
            }).join('');
        };
        
        const renderList = (listItems: any[], listStyle: string): string => {
            let listTag = 'ul';
            let listAttrs = 'style="margin-left: 1.5rem; margin-bottom: 0.5rem;"';
            
            if (listStyle === 'ordered') {
                listTag = 'ol';
            } else if (listStyle === 'checklist') {
                listTag = 'ul';
                listAttrs = 'style="margin-left: 1.5rem; margin-bottom: 0.5rem; list-style: none; padding-left: 0;"';
            }
            
            return `<${listTag} ${listAttrs}>${renderListItems(listItems, listStyle)}</${listTag}>`;
        };
        
        let tag = 'ul';
        let containerAttrs = `style="text-align: ${alignment}; margin-bottom: 1rem; margin-left: 1.5rem;"`;
        
        if (style === 'ordered') {
            tag = 'ol';
        } else if (style === 'checklist') {
            tag = 'ul';
            containerAttrs = `style="text-align: ${alignment}; margin-bottom: 1rem; margin-left: 1.5rem; list-style: none; padding-left: 0;"`;
        }
        
        return `<${tag} ${containerAttrs}>${renderListItems(items, style)}</${tag}>`;
    }
}

const parser = new editorParser(undefined, customParsers);

export default parser;