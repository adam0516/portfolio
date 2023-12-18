class DesktopWindow {
    applyZIndex() {
        let element = document.getElementById(this.id.toString());
        if (!element) return;
        element.style.zIndex = this.zIndex.toString();
    }
    minimize(unMinimize: boolean = false) {
        let element = document.getElementById(this.id.toString());
        if (!element) {
            console.log('element not found');
            return;}
            else console.log('element found');
        if (unMinimize) {
            this.minimized = false;
            element.classList.remove('minimized');
        }
        else {
            this.minimized = true;
            element.classList.add('minimized');
        }
        desktop.updateTaskbarWindows();
    }
    maximize(unMaximize: boolean = false) {
        let element = document.getElementById(this.id.toString());
        if (!element) return;

        if (unMaximize) {
            this.maximized = false;
            element.classList.remove('maximized');
            this.applyDimensions();
            this.applyPosition(null, null);
        }
        else {
            this.maximized = true;
            element.classList.add('maximized');
            this.applyDimensions();
            this.applyPosition(0, 0);
        }

        desktop.updateTaskbarWindows();
    }
    
    static minimizeById(id: number) {
        let element = document.getElementById(id.toString());
        if (!element) return;
        console.log('minimizing window: ' + id.toString());
        
        let window = desktop.windows.find(window => window.id == id);
        if (!window){ return;}
        

        window.minimize(window.minimized);
    }

    static maximizeById(id: number) {
        let element = document.getElementById(id.toString());
        if (!element) return;
        console.log('maximizing window: ' + id.toString());
        
        let window = desktop.windows.find(window => window.id == id);
        if (!window){ return;}

        window.maximize(window.maximized);
    }

    static closeById(id: number) {
        this.minimizeById(id);
        return;
        //Had to remove this to save time as theres currently no way to re-open a closed window

        // let element = document.getElementById(id.toString());
        // if (!element) return;
        // console.log('closing window: ' + id.toString());
        
        // let window = desktop.windows.find(window => window.id == id);
        // if (!window){ return;}

        // element.remove();
        // desktop.windows = desktop.windows.filter(window => window.id != id);
        // desktop.updateTaskbarWindows();
    }
    
    reCenter() {
        this.dimensions.width = 350;
        this.dimensions.height = 450;
        this.position.x = 0;
        this.position.y = 0;
        this.applyDimensions();
        this.applyPosition(null,null);
    }

    applyDimensions() {
        let element = document.getElementById(this.id.toString());
        if (!element) return;
        if(this.maximized) {
            element.style.width = '100%';
            element.style.height = '100%';
            return;
        }
        element.style.width = this.dimensions.width + 'px';
        element.style.height = this.dimensions.height + 'px';
    }

    /**
     * If both parameters are not provided, the window will be centered
     * @param newX sets the new x position of the window directyly to css as top-left based
     * @param newY sets the new y position of the window directyly to css as top-left based
     * @returns void
     */
    applyPosition(newX: number|null, newY: number|null) {
        if (newX == null && newY == null) {
            let screenWidth = window.innerWidth;
            let screenHeight = window.innerHeight;
            newX = (screenWidth / 2) - (this.dimensions.width / 2);
            newY = (screenHeight / 2) - (this.dimensions.height / 2);
        }
        let element = document.getElementById(this.id.toString());
        if (!element) return;
        element.style.left = newX + 'px';
        element.style.top = newY + 'px';
    }

    /**
     * @returns the current x position of the window from top-left
     * Live value, as opposed to the position property which may not be updated
     */
    get positionX() {
        let element = document.getElementById(this.id.toString());
        if (!element) return 0;
        return element.offsetLeft;
    }

    /**
     * @returns the current y position of the window from top-left
     * Live value, as opposed to the position property which may not be updated
     */
    get positionY() {
        let element = document.getElementById(this.id.toString());
        if (!element) return 0;
        return element.offsetTop;
    }

    content: string;
    name: string;
    id: number;
    icon: string;
    active: boolean;
    minimized: boolean;
    maximized: boolean;
    dimensions: {
        width: number;
        height: number;
    };
    position: {
        x: number;
        y: number;
    };
    zIndex: number;
    resizable: boolean;

    
    dragging = false;


    constructor({ content, name, id, icon, active, minimized, dimensions, position, zIndex, resizable }: {
        content: string,
        name: string,
        id: number,
        icon: string,
        active: boolean,
        minimized: boolean,
        dimensions: { width: number, height: number },
        position: { x: number, y: number },
        zIndex: number,
        resizable: boolean
    }) {
        this.content = content;
        this.name = name;
        this.id = id;
        this.icon = icon;
        this.active = active;
        this.minimized = minimized;
        this.maximized = false;
        this.dimensions = dimensions;
        this.position = position;
        this.zIndex = zIndex;
        this.resizable = resizable;
    }
}

class Desktop {
    windows: DesktopWindow[];
    wallpaper: string;
    
    init() {
        let wallpaper = document.createElement('img');
        wallpaper.classList.add('wallpaper');
        wallpaper.src = this.wallpaper;
        
        document.body.appendChild(wallpaper);

        let taskbar = document.createElement('div');
        taskbar.classList.add('taskbar');
        
        let taskbarWindows = document.createElement('div');
        taskbarWindows.classList.add('taskbar-windows');
        taskbar.appendChild(taskbarWindows);
        document.body.appendChild(taskbar);
        
        this.windows.forEach(window => {
            
            this.createWindow(window, false);
        });
        this.updateTaskbarWindows();   
    }

    updateTaskbarWindows() {
        console.log('windows count: ' + this.windows.length);
        let taskbarWindows = document.querySelector('.taskbar-windows');
        if (!taskbarWindows) return;
        taskbarWindows.innerHTML = '';
        this.windows.forEach(window => {
            console.log('creating taskbar window for: ' + window.id);
            let taskbarWindow = document.createElement('div');
            taskbarWindow.classList.add('taskbar-window');
            taskbarWindow.id = 'taskbar-window-' + window.id;
            taskbarWindow.innerHTML = `
                <span class="taskbar-window-icon">
                    <i class="material-icons">${window.icon}</i>
                </span>`;
            if (!window.minimized) {
                taskbarWindow.classList.add('active');
            }
            taskbarWindow.addEventListener('click', () => {
                this.focusWindow(window.id);
            });
            taskbarWindows!.appendChild(taskbarWindow);
        });
    }
    
    constructor(windows: DesktopWindow[], wallpaper: string) {
        this.windows = windows;
        this.wallpaper = wallpaper;

    }
    
    createWindow(nwindow: DesktopWindow, addToWindows: boolean = true) {
        //translate the position from center-center based to topleft-topleft based
        //simpler to center
        const screenWidth = window.innerWidth;
        const xasTl = nwindow.position.x + (screenWidth / 2) - (nwindow.dimensions.width / 2);

        const screenHeight = window.innerHeight;
        const yasTl = nwindow.position.y + (screenHeight / 2) - (nwindow.dimensions.height / 2);

        //create the window in dom
        let newWindow = document.createElement('div');
        newWindow.classList.add('window');
        newWindow.id = nwindow.id.toString();
        newWindow.style.width = nwindow.dimensions.width + 'px';
        newWindow.style.height = nwindow.dimensions.height + 'px';
        newWindow.style.top = yasTl + 'px';
        newWindow.style.left = xasTl + 'px';
        newWindow.style.zIndex = nwindow.zIndex.toString();
    
        // window header
        let windowHeader = document.createElement('div');
        windowHeader.classList.add('window-header');
        let innerHTML = `
            <span class="window-title-buttons">
                <i class="material-icons" onclick="DesktopWindow.closeById(${nwindow.id})">
                close</i>`;
        if (nwindow.resizable) {
            innerHTML += `
                <i class="material-icons" onclick="DesktopWindow.maximizeById(${nwindow.id})">
                fullscreen</i>`;
            innerHTML += `
                <i class="material-icons" onclick="DesktopWindow.minimizeById(${nwindow.id})">
                minimize</i>`;
        }
        innerHTML += `</span>
            <span class="window-title-text">${nwindow.name}
            <i class="material-icons">${nwindow.icon}</i>
            </span>
            <span class="window-title-buttons-secondary"> </span> </span> `;
        windowHeader.innerHTML = innerHTML;
        //| handlers/listeners
        const mouseMoveHandler = (e: MouseEvent) => {
            if (nwindow.dragging) {
                console.log('dragging');
                let curX = nwindow.positionX;
                let curY = nwindow.positionY;

                let newX = curX + e.movementX;
                let newY = curY + e.movementY;

                nwindow.applyPosition(newX, newY);

            }
        }
        const mouseUpHandler = (e: MouseEvent) => {
            nwindow.dragging = false;
            document.removeEventListener('mousemove', mouseMoveHandler);

            //re-enable the css transition
            let element = document.getElementById(nwindow.id.toString());
            if (!element) return;
            element.classList.remove('no-transition');
        }
        newWindow.addEventListener('click', () => {
            this.focusWindow(nwindow.id, true);
        });
        windowHeader.addEventListener('mousedown', (e) => {
            //disable the css transition temporarily
            let element = document.getElementById(nwindow.id.toString());
            if (!element) return;
            element.classList.add('no-transition');

            nwindow.dragging = true;

            this.focusWindow(nwindow.id, true);
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mousemove', mouseMoveHandler);
        });
        document.removeEventListener('mouseup', mouseUpHandler);
        document.addEventListener('mouseup', mouseUpHandler);

        // window content
        let windowContent = document.createElement('div');
        windowContent.classList.add('window-content');
        windowContent.innerHTML = nwindow.content;

        newWindow.appendChild(windowHeader);
        newWindow.appendChild(windowContent);

        // append the window to the body
        document.body.appendChild(newWindow);

        // add the window to the windows array
        if (addToWindows)
            this.windows.push(nwindow);

        // update the taskbar
        this.updateTaskbarWindows();

        if(nwindow.minimized)
            nwindow.minimize();
    }

    focusWindow(id: number, forceFocus: boolean = false) {
        console.log('focusing window: ' + id.toString());
        for (let i = 0; i < this.windows.length; i++) {
            const _window = this.windows[i];
            if (_window.id == id) {
                _window.zIndex = 2;
                _window.active = true;
                if(!forceFocus)
                    _window.minimize(_window.minimized);
                
            } else {
                _window.active = false;
                _window.zIndex = 1;
            }
            _window.applyZIndex();
        }
    }

    minimizeWindow(id: number) {
        for (let i = 0; i < this.windows.length; i++) {
            const window = this.windows[i];
            if (window.id == id) {
                window.minimize();
            }
        }
    }


}

const WELCOME_HTML = `
    <h1>Welcome to mray.dev</h1>
    <p>My name is Adam Murray, and I am a software developer.</p>
    <p>This is a starting point for my portfolio website. It's supposed to mimic a desktop operating system enviroment.
    As you can see, theres still a lot of work to do.</p>
    <p>I started this a little late so it's not as far along as I'd like it to be yet.</p>        
    <p>I plan to add a lot more to this in time.</p>
    <hr>
    <h2>Potential features:</h2>
    <ul>
        <li>Icons on the desktop</li>
        <li>Start menu / app drawer</li>
        <li>Interactive demos of my projects</li>
        <li>Live clock with date</li>
        <li>Drag corners of windows to resize</li>
        <li>Persistancy of state between sessions</li>
        <li>Method for easily scoping css to a specific window</li>
        <li>More...</li>
    `;

const ABOUT_HTML = `
    <h1>About this site</h1>
    <hr>
    <p>I opted to use only TypeScript for this project as the desktop enviroment is almost a framework in itself.</p>
    <p>These windows can hold any html content. I have a starting point of a class system allowing actions to be performed on the windows such as minimizing, maximizing, closing, etc. in a simple and programatic way</p>
    <p>After some refactoring, it should be a pretty solid base to build on.</p>
    <h2>Note:</h2>
    <p>The background image was generated using dalle-3 with dalle-2 to outpaint the edges to increase the aspect ratio.</p>
    <p>Some of the content in the cheat sheets is also AI generated.</p>
    <p>The icons used in the taskbar are from <a href="https://fonts.google.com/icons" target="_blank">Google's Material Icons</a></p>
    `;
    
const HTML_CHEAT_SHEET_HTML = `
    <h1>HTML Cheat Sheet</h1>
    <hr>
    <h2>Tags</h2>
    <p>Tags tell the browser what kind of content needs to be rendered.</p>
    <p>Tags are written as <code>&lt;tag&gt;content&lt;/tag&gt;</code></p>
    <h2>Attributes</h2>
    <p>Attributes tell the browser how to render the content.</p>
    <p>Attributes are written as <code>&lt;tag attribute="value"&gt;content&lt;/tag&gt;</code></p>
    <h1>Common Tags</h1>
    <table>
        <tr>
            <th>Tag</th>
            <th>Description</th>
            <th>Attributes</th>
        </tr>
        <tr>
            <td><code>&lt;div&gt;</code></td>
            <td>Generic container</td>
            <td>None</td>
        </tr>
        <tr>
            <td><code>&lt;span&gt;</code></td>
            <td>Generic inline container</td>
            <td>None</td>
        </tr>
        <tr>
            <td><code>&lt;h1&gt;</code></td>
            <td>Heading</td>
            <td>None</td>
        </tr>
        <tr>
            <td><code>&lt;p&gt;</code></td>
            <td>Paragraph</td>
            <td>None</td>
        </tr>
        <tr>
            <td><code>&lt;img&gt;</code></td>
            <td>Image</td>
            <td>
                <ul>
                    <li>src</li>
                    <li>alt</li>
                    <li>width</li>
                    <li>height</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><code>&lt;a&gt;</code></td>
            <td>Anchor (link)</td>
            <td>
                <ul>
                    <li>href</li>
                    <li>target</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><code>&lt;ul&gt;</code></td>
            <td>Unordered list</td>
            <td>None</td>
        </tr>
        <tr>
            <td><code>&lt;ol&gt;</code></td>
            <td>Ordered list</td>
            <td>None</td>
        </tr>
        <tr>
            <td><code>&lt;li&gt;</code></td>
            <td>List item</td>
            <td>None</td>
        </tr>
        <tr>
            <td><code>&lt;table&gt;</code></td>
            <td>Table</td>
            <td>None</td>
        </tr>
        <tr>
            <td><code>&lt;tr&gt;</code></td>
            <td>Table row</td>
            <td>None</td>
        </tr>

`;

const JS_CHEAT_SHEET_HTML = `
    <h1>JavaScript Cheat Sheet</h1>
    <hr>
    <h2>Variables</h2>
    <p>Variables are used to store data.</p>
    <p>Variables are declared with <code>let</code>, <code>const</code>, or <code>var</code></p>
    <p><code>let</code> and <code>const</code> are block scoped, <code>var</code> is function scoped</p>
    <p>Use in order of <code>const</code>, <code>let</code>, then <code>var</code></p> as the first occurance in that order will be the most optimal</p>
    <h2>Functions</h2>
    <p>Functions are used to perform actions.</p>
    <p>Functions are declared with <code>function</code> or <code>() =></code></p>
    <p>Functions can be called by using their name followed by <code>()</code></p>
    <p>Functions can be passed as arguments to other functions allowing for callbacks</p>
    <h2>Objects</h2>
    <p>Objects are used to store data in key-value pairs.</p>
    <p>Objects are declared with <code>{}</code></p>
    <p>Objects can be accessed with <code>object.key</code> or <code>object["key"]</code></p>
    <h2>Typing</h2>
    <p>JavaScript is a dynamically typed language, meaning any variable can be any type, including a function and will mutate it's type as needed.</p>
    <p>JavaScript is also weakly typed, meaning it will attempt to coerce types when needed.</p>
    <h2>Async</h2>
    <p>JavaScript is asynchronous, meaning it can perform actions without blocking the main thread.</p>
    <p>Asynchronous actions are performed by using <code>async</code> and <code>await</code></p>
    <p><code>async</code> tells the function to return a promise</p>
    <p><code>await</code> tells the function to wait for the promise to resolve before continuing and potentially taking it's value</p>
    <h2>Common built-in functions</h2>
    <table>
        <tr>
            <th>Function</th>
            <th>Description</th>
        </tr>
        <tr>
            <td><code>console.log()</code></td>
            <td>Prints to the console</td>
        </tr>
        <tr>
            <td><code>setTimeout()</code></td>
            <td>Executes a function after a specified amount of time</td>
        </tr>
        <tr>
            <td><code>setInterval()</code></td>
            <td>Executes a function repeatedly after a specified amount of time</td>
        </tr>
        <tr>
            <td><code>fetch()</code></td>
            <td>Fetches a resource from a url</td>
        </tr>
        <tr>
            <td><code>addEventListener()</code></td>
            <td>Adds an event listener to an element</td>
        </tr>
        <tr>
            <td><code>document.getElementById()</code></td>
            <td>Gets an element from the document by it's id</td>
        </tr>
        <tr>
            <td><code>document.querySelector()</code></td>
            <td>Gets an element from the document by a css selector</td>
        </tr>
        <tr>
            <td><code>document.createElement()</code></td>
            <td>Creates an element</td>
        </tr>
        <tr>
            <td><code>document.body.appendChild()</code></td>
            <td>Appends an element to the body</td>
        </tr>
        <tr>
            <td><code>document.body.removeChild()</code></td>
            <td>Removes an element from the body</td>
        </tr>
        <tr>
            <td><code>document.body.innerHTML</code></td>
            <td>Gets or sets the inner html of the body</td>
        </tr>
        <tr>
            <td><code>document.body.innerText</code></td>
            <td>Gets or sets the inner text of the body</td>
        </tr>
        <tr>
            <td><code>document.body.classList.add()</code></td>
            <td>Adds a class to the body</td>
        </tr>
        <tr>

    `;

const CSS_CHEAT_SHEET_HTML = `
    <h1>CSS Cheat Sheet</h1>
    <hr>
    <h2>Selectors</h2>
    <p>Selectors are used to select elements to apply styles to.</p>
    <p>Selectors are written as <code>selector { styles }</code></p>
    <h2>Styles</h2>
    <p>Styles are used to style elements.</p>
    <p>Styles are written as <code>property: value;</code></p>
    <p>Styles can be applied to multiple selectors by separating them with a comma</p>
    <p>Styles can be applied to child elements by using a space</p>
    <p>Styles can be applied to direct child elements by using a greater than sign</p>
    <p>Styles can be applied to all elements by using an asterisk</p>
    <h2>Common properties</h2>
    <table>
        <tr>
            <th>Property</th>
            <th>Description</th>
        </tr>
        <tr>
            <td><code>background-color</code></td>
            <td>Sets the background color</td>
        </tr>
        <tr>
            <td><code>color</code></td>
            <td>Sets the text color</td>
        </tr>
        <tr>
            <td><code>font-size</code></td>
            <td>Sets the font size</td>
        </tr>
        <tr>
            <td><code>font-family</code></td>
            <td>Sets the font family</td>
        </tr>
        <tr>
            <td><code>font-weight</code></td>
            <td>Sets the font weight</td>
        </tr>
        <tr>
            <td><code>width</code></td>
            <td>Sets the width</td>
        </tr>
        <tr>
            <td><code>height</code></td>
            <td>Sets the height</td>
        </tr>
        <tr>
            <td><code>padding</code></td>
            <td>Sets the padding</td>
        </tr>
        <tr>
            <td><code>margin</code></td>
            <td>Sets the margin</td>
        </tr>
        <tr>
            <td><code>border</code></td>
            <td>Sets the border</td>
        </tr>
        <tr>
            <td><code>border-radius</code></td>
            <td>Sets the border radius</td>
        </tr>
        <tr>
            <td><code>display</code></td>
            <td>Sets the display type</td>
        </tr>
        <tr>
            <td><code>position</code></td>
            <td>Sets the position type</td>
        </tr>
        <tr>
            <td><code>top</code></td>
            <td>Sets the top position</td>
        </tr>
        <tr>
            <td><code>left</code></td>
            <td>Sets the left position</td>
        </tr>
        <tr>
            <td><code>right</code></td>
            <td>Sets the right position</td>
        </tr>
        <tr>
            <td><code>bottom</code></td>
            <td>Sets the bottom position</td>
        </tr>
    </table>

`;

let windows: DesktopWindow[] = [
    new DesktopWindow({
        content: WELCOME_HTML,
        name: 'Welcome',
        id: 1,
        icon: 'info',
        active: true,
        minimized: false,
        dimensions: {
            width: 400,
            height: 500
        },
        position: {
            x: -50,
            y: -50
        },
        zIndex: 1,
        resizable: true
    }),
    

];

let desktop = new Desktop(windows, 'background.png');
desktop.init();

desktop.createWindow(new DesktopWindow({
    content: ABOUT_HTML,
    name: 'About',
    id: 2,
    icon: 'help',
    active: true,
    minimized: true,
    dimensions: {
        width: 400,
        height: 400
    },
    position: {
        x: 50,
        y: 50
    },
    zIndex: 1,
    resizable: true
}));

desktop.createWindow(new DesktopWindow({
    content: HTML_CHEAT_SHEET_HTML,
    name: 'HTML Cheat Sheet',
    id: 3,
    icon: 'code',
    active: true,
    minimized: true,
    dimensions: {
        width: 600,
        height: 600
    },
    position: {
        x: 0,
        y: 0
    },
    zIndex: 1,
    resizable: true
}));

desktop.createWindow(new DesktopWindow({
    content: JS_CHEAT_SHEET_HTML,
    name: 'JavaScript Cheat Sheet',
    id: 4,
    icon: 'javascript',
    active: true,
    minimized: true,
    dimensions: {
        width: 600,
        height: 600
    },
    position: {
        x: 0,
        y: 0
    },
    zIndex: 1,
    resizable: true
}));

desktop.createWindow(new DesktopWindow({
    content: CSS_CHEAT_SHEET_HTML,
    name: 'CSS Cheat Sheet',
    id: 5,
    icon: 'style',
    active: true,
    minimized: true,
    dimensions: {
        width: 600,
        height: 600
    },
    position: {
        x: 0,
        y: 0
    },
    zIndex: 1,
    resizable: true
}));

