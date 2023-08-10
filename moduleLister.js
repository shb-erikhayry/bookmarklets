javascript: (() => {
    function getLanguage(){
        return window.location.pathname.split('/')[1];
    }

    function getAsUrl(id){
        return `${document.location.origin}/${getLanguage()}/${id}`;
    }

    function toModulesFromModules(currentModules, id, { type }){
        if(currentModules[type]){
            currentModules[type].push(getAsUrl(id));
        } else if(type) {
            currentModules[type] = [getAsUrl(id)];
        }

        return currentModules;
    }

    function toModulesFromSections(currentModules, id, { modules }){
        return modules.reduce((currentModules, module) => toModulesFromModules(currentModules, id, module), currentModules);
    }

    function toModulesFromViews(currentModules, { views, sections, id }){
        if(views){
            return views.reduce(toModulesFromViews, currentModules);
        }

        return sections.reduce((currentModules, section) => toModulesFromSections(currentModules, id, section), currentModules);
    }

    function getLink(url){
        const link = document.createElement("a");
        link.setAttribute('href', url);
        link.setAttribute('target', '_blank');
        link.style.display = 'block';
        link.style.padding = '8px 32px';
        link.appendChild(document.createTextNode(url));

        return link;
    }

    function getDetails(name, urls){
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.appendChild(document.createTextNode(`${name} (${urls.length})`));
        details.appendChild(summary);

        return details;
    }

    function createOverlay(content){
        const wrapper = document.createElement("div");

        content.forEach(({name, urls}) => {
            const details = getDetails(name, urls);

            urls.forEach((url) => {
                details.appendChild(getLink(url));
            });

            wrapper.appendChild(details);
        });

        document.write(wrapper.innerHTML);
    }

    function toArray([name, urls]) {
        return { name, urls }
    }

    function alphabetically({ name: name1}, { name: name2}){
        if (name1 < name2) {
            return -1;
        }
        if (name1 > name2) {
            return 1;
        }
        return 0;
    }

    function getSiteMapUrl(){
        const scriptSrc = new URL(document.getElementById('app-entrypoint-script').src);
        const rev = scriptSrc.searchParams.get('rev');

        return `${window.location.origin}/tron/public/ui/configurations/v1/sitemap/sitemap?rev=${rev}&lang=${getLanguage()}`;
    }

    async function init(){
        const response = await fetch(getSiteMapUrl());
        const { views } = await response.json();
        createOverlay(Object.entries(views.reduce(toModulesFromViews, {})).map(toArray).sort(alphabetically));
    }

    init();
})();