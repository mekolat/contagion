"use strict";

class Grid {
    /**
     * @param {Element} node
     * @param {number} size
     */
    constructor(node, size=8) {
        /** @const {number} */ this.size = size; // board size (size * size)
        /** @const {number} */ this.num_tiles = size * size; // total number of tiles
        /** @const {Element} */ this.node = node; // the grid node
        /** @type {number} */ this.free_tiles = this.num_tiles; // number of free tiles
        /** @type {number} */ this.red_tiles = 0; // number of red tiles
        /** @type {number} */ this.blue_tiles = 0; // number of blue tiles
        /** @const {!Array<Tile>} */ this.tiles = new Array(this.num_tiles); // array containing all Tile()
        /** @private {Tile} */ this._active = null; // the highlighted tile
        this._makeTable();
    }

    apply() {
        this.tiles.forEach(tile => tile.color = tile.value);
        this.active = null;
    }

    /**
     * @return {Tile}
     */
    get active() {
        return this._active;
    }

    /**
     * @param {Tile} t
     */
    set active(t) {
        if (this._active !== null)
            this._active.node.classList.remove("active");

        if (t === null)
        {
            this._active = null;
            return;
        }

        this._active = this.tiles[t.id];
        this._active.node.classList.add("active");
    }

    /**
     * @private
     */
    _makeTable() {
        /** @type {!number} */ let i = 0;
        /** @type {!number} */ let j = 0;
        /** @type {!number} */ let e = 0;

        /** @const {!Element} */
        const tbl  = document.createElement("table");

        for(; i < this.size; i++){
            /** @const {!Element} */ const tr = tbl.insertRow();
            for(j = 0; j < this.size; j++){
                this.tiles[e] = new Tile(this, e++, tr);
            }
        }
        this.tiles.forEach(tile => tile._findNeighbors());
        this.node.appendChild(tbl);
    }
}

class Tile {
    /**
     * @param {!Grid} parent
     * @param {!number} id
     * @param {!Element} tr
     */
    constructor(parent, id, tr) {
        /** @const {!number} */ this.id = id;
        /** @const {!Grid} */ this.parent = parent; // grid
        /** @const {!number} */ this.rpos = id % this.parent.size; // position in row
        /** @const {!number} */ this.cpos = Math.floor(id / this.parent.size); // position in column
        /** @const {!Element} */ this.node = tr.insertCell(); // DOM element
        /** @const {!Array<!Set<Tile>, !Set<Tile>>} */ this.neighbors = [new Set(), new Set()];
        /** @private {!number} */ this._color = 0; // highlight color
        /** @private {!number} */ this._value = 0; // actual value

        this.node.addEventListener("click", () => this.parent.node.dispatchEvent(new CustomEvent("cell_click", {detail: this.id})), false);
        this.node.addEventListener("contextmenu", e => this.parent.node.dispatchEvent(new CustomEvent("cell_rclick", {detail: [e, this.id]})), false);
    }

    /**
     * @return {!number}
     */
    get color() {
        return this._color;
    }

    /**
     * @param {!number} c
     */
    set color(c) {
        c = Math.max(0, Math.min(c, 7));
        if (this._color !== c)
        {
            this.node.className = "c_" + c;
            this._color = c;
        }
    }

    /**
     * @return {!number}
     */
    get value() {
        return this._value;
    }

    /**
     * @param {!number} v
     */
    set value(v) {
        v = Math.max(0, Math.min(v, 7));

        switch (this.value) {
            case v: return; // don't do anything
            case 1: this.parent.red_tiles--; break;
            case 5: this.parent.blue_tiles--; break;
            case 0: this.parent.free_tiles--;
        }

        switch (v) {
            case 1: this.parent.red_tiles++; break;
            case 5: this.parent.blue_tiles++; break;
            case 0: this.parent.free_tiles++;
        }

        this._value = v;
    }

    /**
     * @private
     */
    _findNeighbors() {
        // remotes
        if (this.id - (this.parent.size * 2) >= 0)
            this.neighbors[0].add(this.parent.tiles[this.id - (this.parent.size * 2)]);
        if (this.id - 2 >= 0 && this.rpos > 1)
            this.neighbors[0].add(this.parent.tiles[this.id - 2]);
        if (this.id + 2 < this.parent.num_tiles && this.rpos < (this.parent.size - 2))
            this.neighbors[0].add(this.parent.tiles[this.id + 2]);
        if (this.id + (this.parent.size * 2) < this.parent.num_tiles)
            this.neighbors[0].add(this.parent.tiles[this.id + (this.parent.size * 2)]);

        // siblings
        if (this.id - (this.parent.size + 1) >= 0 && this.rpos > 0)
            this.neighbors[1].add(this.parent.tiles[this.id - (this.parent.size + 1)]);
        if (this.id - this.parent.size >= 0)
            this.neighbors[1].add(this.parent.tiles[this.id - this.parent.size]);
        if (this.id - (this.parent.size - 1) >= 0 && this.rpos < (this.parent.size - 1))
            this.neighbors[1].add(this.parent.tiles[this.id - (this.parent.size - 1)]);
        if (this.id - 1 >= 0 && this.rpos > 0)
            this.neighbors[1].add(this.parent.tiles[this.id - 1]);
        if (this.id + 1 < this.parent.num_tiles && this.rpos < (this.parent.size - 1))
            this.neighbors[1].add(this.parent.tiles[this.id + 1]);
        if (this.id + (this.parent.size - 1) < this.parent.num_tiles && this.rpos > 0)
            this.neighbors[1].add(this.parent.tiles[this.id + (this.parent.size - 1)]);
        if (this.id + this.parent.size < this.parent.num_tiles)
            this.neighbors[1].add(this.parent.tiles[this.id + this.parent.size]);
        if (this.id + (this.parent.size + 1) < this.parent.num_tiles && this.rpos < (this.parent.size - 1))
            this.neighbors[1].add(this.parent.tiles[this.id + (this.parent.size + 1)]);
    }
}





/** @const {!Map<!string, !Element>} */
const nodes = new Map();

Object.entries({
    "grid":       ".grid",
    "load":       ".load > select",
    "menu":       ".menu",
    "redo":       "button.redo",
    "save":       ".save > select",
    "status":     ".status",
    "undo":       "button.undo",
    "player":     ".player",
    "red":        ".red",
    "blue":       ".blue",
    "perma":      "a.perma",
    "switch":     "button.switch",
    "layout":     ".layout",
    "pick":       ".layout > select",
    "new":        ".layout > button",
    "caching":    ".online",
}).forEach(v => {
    /** @type {Element} */ let node = document.querySelector(v[1]);
    if (node === null)
        throw new Error(`Node not found in document! => \`${v[1]}\``);
   nodes.set(v[0], node);
});


/** @const {!Grid} */
const grid = new Grid(nodes.get("grid"));

/** @const {!Array<!Array<!string, !string>>} */
const layouts = Object.entries({
    "gumi 01": "1000000500000000000000000000000000000000000000000000000050000001",
    "gumi 02": "1400004544000044000000000000000000000000000000004400004414000045",
    "gumi 03": "1000000004400000040000000000000000000000000000400000044000000005",
    "gumi 04": "5040040500400400440000440000000000000000440000440040040010400401",
    "gumi 05": "0000000000000000004004001004400510044005004004000000000000000000",
    "gumi 06": "0000000004000040100440050040040000400400100440050400004000000000",
    "gumi 07": "0000000004000040004554000004400000044000004114000400004000000000",
    "gumi 08": "1004400500044000000440000000000000000000000440000004400050044001",
    "gumi 09": "0000000000000000000110000044440000444400000550000000000000000000",
    "gumi 10": "4004400440044004040000401400004514000045040000404004400440044004",
    "gumi 11": "1000005001000005100000500100000510000050010000051000005001000005",
    "gumi 12": "1000000504400440044004400004400000044000044004400440044050000001",
    "gumi 13": "0000000000400400044114400054450000544500044114400040040000000000",
    "gumi 14": "5004400100000000004004004000000440000004004004000000000010044005",
    "gumi 15": "0001500000100500010000501000000550000001050000100050010000051000",
    "gumi 16": "1040400000040405104040000004040510404000000404051040400000040405",
    "gumi 17": "1000000501000050001005000001500000051000005001000500001050000001",
    "gumi 18": "0000000004444440040005400400004004000040041000400444444000000000",
    "Tirifto 01": "5000000104044040040000400000000000144500000000000004400000400400",
    "Tirifto 02": "0004500004000040004004001000000440000001004004000400004000054000",
    "Tirifto 03": "4440044445000014404004040000000000000000404004044100005444400444",
    "Tirifto 04": "0001100000044000000000001400004514000045000000000004400000055000",
    "Tirifto 05": "4100005414000045000000000000000000000000000000005400004145000014",
    "Tirifto 06": "4000000401000050004444000040040000400400004444000500001040000004",
    "Tirifto 07": "0140045014000045400040040040000000000400400400045400004105400410",
    "Tirifto 08": "0050500405050000505004000500000150000010004001010000101040010100",
});

/** @private {!number} */ let _current_player = 0;
/** @private {Tile} */ let _right_click_tile = null;

/** @const {!Array<!Array<!Uint8Array>>} */
const _move_history = [[], []]; // undo, redo

/** @const {!Array<(number|Array<!(string|number|Array<!string>)>)>} */
const savestate = [2];

/** @const {!function(!(string|number)=, !number=)} */
const new_game = (layout = Math.floor(Math.random()*layouts.length),
                player = Math.round(Math.random())) => {

    if (typeof layout === "number")
        layout = layouts[layout][1];

    layout.split("").forEach((v, k) => grid.tiles[k].value = +v);
    grid.apply();
    undo_history.length = 0;
    redo_history.length = 0;
    current_player = +player;
};

/** @const {!function(!(number|Event))} */
const save_click = slot => {
    if (typeof slot !== "number")
        slot = nodes.get("save").selectedIndex;

    if (slot < 1)
        return;

    nodes.get("save").selectedIndex = 0;

    savestate[slot] = [
        grid.tiles.map(t => t.value).join(""),
        undo_history.map(t => t.join("")),
        redo_history.map(t => t.join("")),
        +current_player,
    ];

    localStorage.setItem("savestate", JSON.stringify(savestate));
    nodes.get("status").innerText = "saved to slot " + slot;
};

/** @const {!function(!(number|Event))} */
const load_click = slot => {
    if (typeof slot !== "number")
        slot = nodes.get("load").selectedIndex;

    if (slot < 1)
        return;

    nodes.get("load").selectedIndex = 0;

    if (!(slot in savestate) || savestate[slot] === null)
    {
        nodes.get("status").innerText = "slot " + slot + " is empty";
        return;
    }

    undo_history.length = 0;
    redo_history.length = 0;
    savestate[slot][0].split("").forEach((v, k) => grid.tiles[k].value = +v);
    savestate[slot][1].forEach(v => undo_history.push(Uint8Array.from(v)));
    savestate[slot][2].forEach(v => redo_history.push(Uint8Array.from(v)));

    grid.apply();
    current_player = +savestate[slot][3];

    nodes.get("status").innerText = "loaded slot " + slot;
};

const undo_history = new Proxy(_move_history[0], {
    set: (target, name, value) => {
        target[name] = value;
        nodes.get("undo").disabled = (target.length < 1);
        return true;
    }
});

const redo_history = new Proxy(_move_history[1], {
    set: (target, name, value) => {
        target[name] = value;
        nodes.get("redo").disabled = (target.length < 1);
        return true;
    }
});

Reflect.defineProperty(self, "current_player", {
    get: () => _current_player,
    set: v => {
        grid.node.classList.remove("p" + _current_player);
        grid.node.classList.add("p" + v);
        nodes.get("player").innerText = "(none)";
        nodes.get("blue").innerText = grid.blue_tiles;
        nodes.get("red").innerText = grid.red_tiles;

        history.replaceState({}, document.title, "#" + grid.tiles.map(t => t.value).join("") + v);
        nodes.get("perma").href = document.location.href;

        if (grid.free_tiles < 1)
        {
            grid.node.className = "grid";
            nodes.get("switch").disabled = true;
            nodes.get("layout").classList.add("endgame");

            if (grid.red_tiles > grid.blue_tiles)
                nodes.get("status").innerText = "red wins";
            else if (grid.blue_tiles > grid.red_tiles)
                nodes.get("status").innerText = "blue wins";
            else
                nodes.get("status").innerText = "draw";
        }
        else
        {
            nodes.get("status").innerText = "game in progress";
            nodes.get("player").innerText = v ? "blue" : "red";
            nodes.get("switch").disabled = false;
            nodes.get("layout").classList.remove("endgame");
        }

        _current_player = v;
    }
});

Reflect.defineProperty(self, "right_click_tile", {
    get: () => _right_click_tile,
    set: v => {
        if (v !== null)
        {
            v.detail[0].preventDefault();
            v.detail[0].stopPropagation();
            v.stopPropagation();

            nodes.get("menu").style.left = v.detail[0].clientX + "px";
            nodes.get("menu").style.top = v.detail[0].clientY + "px";
            nodes.get("menu").style.display = "block";
            v = grid.tiles[v.detail[1]];

            if (grid.active !== null)
                grid.apply();
        }

        else
            nodes.get("menu").style.display = "none";

        _right_click_tile = v;
    }
});

Reflect.defineProperty(self, "easter_egg", {
    get: () => document.location.href = "https://youtu.be/lbWhFhITBhg",
});


grid.node.addEventListener("cell_click", e => {
    if (grid.free_tiles < 1)
        return;

    let tile = grid.tiles[e.detail],
        contaminate = () => {
            let can_move = false,
                red_can_move = false,
                blue_can_move = false,
                claim_free = p => {
                    grid.tiles.forEach(t => {
                        if (t.value === 0)
                            t.value = p ? 5 : 1;
                    })
                };

            tile.value = (current_player ? 5 : 1); // contaminate center
            tile.neighbors[1].forEach(t => { if (t.value === (current_player ? 1 : 5)) t.value = (current_player ? 5 : 1) }); // contaminate adjacent tiles

            if (grid.red_tiles < 1)
            {
                claim_free(1);
                return;
            }
            else if (grid.blue_tiles < 1)
            {
                claim_free(0);
                return;
            }

            grid.tiles.forEach(t => {
                if (red_can_move && blue_can_move)
                    return;

                if (t.value === 1 || t.value === 5)
                {
                    can_move = [...t.neighbors[0], ...t.neighbors[1]].some(r => r.value === 0);

                    if (can_move === true && t.value === 1)
                        red_can_move = true;
                    else if (can_move === true && t.value === 5)
                        blue_can_move = true;
                }
            });

            if (red_can_move === false)
            {
                claim_free(1);
            }
            else if (blue_can_move === false)
            {
                claim_free(0);
            }
        };


    if (right_click_tile !== null)
        right_click_tile = null;

    if (grid.active !== null && tile !== grid.active && tile.color !== (current_player ? 6 : 2) && tile.color !== (current_player ? 7 : 3))
        grid.apply(); // implicitely removes active

    switch (tile.color)
    {
        case 1:
        case 2:
        case 3:
            if (current_player !== 0)
                return;
            break;
        case 5:
        case 6:
        case 7:
            if (current_player !== 1)
                return;
            break;
        default: return;
    }

    if (grid.active !== null)
    {
        if (tile !== grid.active && [2,3,6,7].includes(tile.color))
        {
            redo_history.length = 0; // empty redo history
            undo_history.push(Uint8Array.from(grid.tiles.map(t => t.value))); // push to undo history

            if (tile.color === 3 || tile.color === 7)
                grid.active.value = 0; // remove from origin

            contaminate();

            current_player ^= 1; // switch player, calculate tiles
        }

        grid.apply();

        if (tile.color !== 1 || tile.color !== 5)
            return;
    }

    if (tile.value !== 1 && tile.value !== 5)
        return;

    grid.active = tile;
    tile.neighbors[0].forEach(n => { if(n.value === 0) n.color = (current_player ? 7 : 3) });
    tile.neighbors[1].forEach(n => { if(n.value === 0) n.color = (current_player ? 6 : 2) });
}, false);

grid.node.addEventListener("cell_rclick", e => {right_click_tile = e; return}, false);

nodes.get("menu").addEventListener("click", e => {
    if ("v" in e.target.dataset && right_click_tile !== null)
    {
        right_click_tile.value = parseInt(e.target.dataset["v"], 10);
        right_click_tile.color = right_click_tile.value;
        current_player |= 0; // just to calculate tiles
    }

    right_click_tile = null;
}, false);

document.addEventListener("click", e => {
    if (right_click_tile !== null && !e.path.includes(nodes.get("menu")))
        right_click_tile = null;

    if (grid.active !== null && !e.path.includes(nodes.get("grid")))
        grid.apply();
}, false);

nodes.get("switch").addEventListener("click", () => {current_player ^= 1; return}, false);

nodes.get("undo").addEventListener("click", () => {
    if (undo_history.length < 1)
        return;

    redo_history.push(Uint8Array.from(grid.tiles.map(t => t.value))); // push to redo history
    undo_history.pop().forEach((v, k) => grid.tiles[k].value = v);
    grid.apply();
    current_player ^= 1;

}, false);

nodes.get("redo").addEventListener("click", () => {
    if (redo_history.length < 1)
        return;

    undo_history.push(Uint8Array.from(grid.tiles.map(t => t.value))); // push to undo history
    redo_history.pop().forEach((v, k) => grid.tiles[k].value = v);
    grid.apply();
    current_player ^= 1;

}, false);

nodes.get("new").addEventListener("click", () => {
    let layout = nodes.get("pick").selectedIndex - 1;
    if (layout < 0)
        new_game();
    else
        new_game(layout);
}, false);

self.addEventListener("hashchange", e => {
    if (e.isTrusted && (new RegExp("^#[0145]{"+ grid.num_tiles +"}[01]{1}$")).test(document.location.hash))
        new_game(document.location.hash.slice(1, -1), +document.location.hash.slice(-1));
}, false);

nodes.get("perma").addEventListener("click", e => {
    let success = false,
        range = document.createRange(),
        before = nodes.get("status").innerText;

    e.preventDefault();
    e.stopPropagation();

    self.getSelection().removeAllRanges(); // remove any leftovers
    nodes.get("status").innerText = document.location.href; // change status to the url

    try {
        range.selectNode(nodes.get("status")); // add status to the range
        self.getSelection().addRange(range); // make the browser select the range
        success = document.execCommand('copy');
    } catch(r) {
        success = false;
    }

    self.getSelection().removeAllRanges(); // unselect

    nodes.get("status").innerText = success ? "copied to clipboard" : before;
}, false);

nodes.get("save").addEventListener("change", save_click, false);
nodes.get("load").addEventListener("change", load_click, false);

document.addEventListener("keyup", e => {
    let num = 0;
    if (e.isTrusted && (num = /^(?:Digit|Numpad)(\d)$/.exec(e.code)) !== null)
    {
        num = parseInt(num[1], 10);

        if (num < 1)
            new_game();

        else
        {
            if (e.shiftKey)
                save_click(num);
            else
                load_click(num);
        }
    }
}, false);




layouts.forEach(layout => {
    let l = document.createElement("option");
    l.innerText = layout[0];
    nodes.get("pick").appendChild(l);
});

if ((new RegExp("^#[0145]{"+ grid.num_tiles +"}[01]{1}$")).test(document.location.hash))
    new_game(document.location.hash.slice(1, -1), +document.location.hash.slice(-1));
else
    new_game();

if ("savestate" in localStorage)
{
    savestate.length = 0; // forcefully empty it
    JSON.parse(localStorage.getItem("savestate")).forEach(s => savestate.push(s));
    if (savestate.length < 1 || typeof savestate[0] !== "number" || savestate[0] < 2)
    {
        console.warn("Dropping empty or invalid savestate", Array.from(savestate));
        savestate.length = 0; // forcefully empty it
        savestate.push(2); // push version
    }
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("service-worker.js")
        .then(() => {
            console.log("Service Worker Registered");
            nodes.get("caching").innerText = "Available offline";
            nodes.get("caching").className = "offline";
        })
        .catch(() => console.warn("Service Worker Unavailable"));
}
else
    console.warn("Navigator does not support Service Workers");

console.info("\ud83e\udd5a %cThis application does not contain easter eggs", "font-weight:bolder;font-size:1.2em");
