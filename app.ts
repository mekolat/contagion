/**
 * @license
 *
 * To the extent possible under law, the author(s) have dedicated all copyright
 * and related and neighboring rights to this software to the public domain
 * worldwide. This software is distributed without any warranty.
 *
 * You should have received a copy of the CC0 Public Domain Dedication along with
 * this software. If not, see <https://creativecommons.org/publicdomain/zero/1.0/>
 *
 */

"use strict";

enum TileColor {Empty, Red, RedNeighbor, RedRemote, Blocked, Blue, BlueNeighbor, BlueRemote}
enum TileValue {Empty = TileColor.Empty, Red = TileColor.Red, Blocked = TileColor.Blocked, Blue = TileColor.Blue}
enum Player {Red, Blue}
enum CPUMode {Dumb, Savvy}

const SAVESTATE_VERSION: number = 2;

class Grid {

    public size: number;
    public num_tiles: number;
    public node: HTMLElement;
    public free_tiles: number;
    public red_tiles: number;
    public blue_tiles: number;
    public tiles: Tile[];
    public _tbl: HTMLTableElement;

    private _active: Tile;

    constructor(node: HTMLElement, size: number = 8) {
        this.size = size; // board size (size * size)
        this.num_tiles = size * size; // total number of tiles
        this.node = node; // the grid node
        this.free_tiles = this.num_tiles; // number of free tiles
        this.red_tiles = 0; // number of red tiles
        this.blue_tiles = 0; // number of blue tiles
        this.tiles = new Array(this.num_tiles); // array containing all Tile()
        this._active = null; // the highlighted tile
        this._makeTable();
    }

    public apply(): void {
        this.tiles.forEach((tile: Tile) => tile.color = tile.value as number);
        this.active = null;
        return;
    }

    get active(): Tile {
        return this._active;
    }

    set active(t: Tile) {
        if (this._active !== null) {
            this._active.node.classList.remove("active");
        }

        if (t === null) {
            this._active = null;
            return;
        }

        this._active = this.tiles[t.id];
        this._active.node.classList.add("active");
        return;
    }

    private _makeTable(): void {
        let i: number = 0;
        let j: number = 0;
        let e: number = 0;

        this._tbl = document.createElement("table");

        for (; i < this.size; i++) {
            const tr: HTMLTableRowElement = this._tbl.insertRow();
            for (j = 0; j < this.size; j++) {
                this.tiles[e] = new Tile(this, e++, tr);
            }
        }
        this.tiles.forEach((tile: Tile): void => tile._findNeighbors());
        this.node.appendChild(this._tbl);
        return;
    }
}

class Tile {

    public id: number;
    public parent: Grid;
    public rpos: number;
    public cpos: number;
    public node: HTMLTableCellElement;
    public neighbors: [Set<Tile>, Set<Tile>];

    private _color: TileColor;
    private _value: TileValue;

    constructor(parent: Grid, id: number, tr: HTMLTableRowElement) {
        this.id = id;
        this.parent = parent; // grid
        this.rpos = id % this.parent.size; // position in row
        this.cpos = Math.floor(id / this.parent.size); // position in column
        this.node = tr.insertCell(); // DOM element
        this.neighbors = [new Set(), new Set()];
        this._color = 0; // highlight color
        this._value = 0; // actual value

        this.node.addEventListener("click", () => {
            this.parent.node.dispatchEvent(new CustomEvent("cell_click", {detail: this.id}));
        }, false);
        this.node.addEventListener("contextmenu", (e: MouseEvent) => {
            this.parent.node.dispatchEvent(new CustomEvent("cell_rclick", {detail: [e, this.id]}));
        }, false);
    }

    get color(): TileColor {
        return this._color;
    }

    set color(c: TileColor) {
        if (this._color !== c) {
            this.node.className = "c_" + c;
            this._color = c;
        }
        return;
    }

    get value(): TileValue {
        return this._value;
    }

    set value(v: TileValue) {
        switch (this.value) {
            case v: return; // don't do anything
            case TileValue.Red: this.parent.red_tiles--; break;
            case TileValue.Blue: this.parent.blue_tiles--; break;
            case TileValue.Empty: this.parent.free_tiles--;
        }

        switch (v) {
            case TileValue.Red: this.parent.red_tiles++; break;
            case TileValue.Blue: this.parent.blue_tiles++; break;
            case TileValue.Empty: this.parent.free_tiles++;
        }

        this._value = v;
        return;
    }

    public _findNeighbors(): void {
        // remotes
        if (this.id - (this.parent.size * 2) >= 0) {
            this.neighbors[0].add(this.parent.tiles[this.id - (this.parent.size * 2)]);
        }
        if (this.id - 2 >= 0 && this.rpos > 1) {
            this.neighbors[0].add(this.parent.tiles[this.id - 2]);
        }
        if (this.id + 2 < this.parent.num_tiles && this.rpos < (this.parent.size - 2)) {
            this.neighbors[0].add(this.parent.tiles[this.id + 2]);
        }
        if (this.id + (this.parent.size * 2) < this.parent.num_tiles) {
            this.neighbors[0].add(this.parent.tiles[this.id + (this.parent.size * 2)]);
        }

        // siblings (adjacent)
        if (this.id - (this.parent.size + 1) >= 0 && this.rpos > 0) {
            this.neighbors[1].add(this.parent.tiles[this.id - (this.parent.size + 1)]);
        }
        if (this.id - this.parent.size >= 0) {
            this.neighbors[1].add(this.parent.tiles[this.id - this.parent.size]);
        }
        if (this.id - (this.parent.size - 1) >= 0 && this.rpos < (this.parent.size - 1)) {
            this.neighbors[1].add(this.parent.tiles[this.id - (this.parent.size - 1)]);
        }
        if (this.id - 1 >= 0 && this.rpos > 0) {
            this.neighbors[1].add(this.parent.tiles[this.id - 1]);
        }
        if (this.id + 1 < this.parent.num_tiles && this.rpos < (this.parent.size - 1)) {
            this.neighbors[1].add(this.parent.tiles[this.id + 1]);
        }
        if (this.id + (this.parent.size - 1) < this.parent.num_tiles && this.rpos > 0) {
            this.neighbors[1].add(this.parent.tiles[this.id + (this.parent.size - 1)]);
        }
        if (this.id + this.parent.size < this.parent.num_tiles) {
            this.neighbors[1].add(this.parent.tiles[this.id + this.parent.size]);
        }
        if (this.id + (this.parent.size + 1) < this.parent.num_tiles && this.rpos < (this.parent.size - 1)) {
            this.neighbors[1].add(this.parent.tiles[this.id + (this.parent.size + 1)]);
        }
    }
}

class CPU {

    public enabled: boolean;
    public player: Player;
    public mode: CPUMode = CPUMode.Dumb;

    private grid: Grid;
    private _delay: number; // unused

    constructor(target_grid: Grid, player: Player = Player.Red, enabled: boolean = false) {
        this.grid = target_grid;
        this.player = player;
        this.enabled = enabled;
    }

    public play_once(): boolean {

        if (current_player !== this.player || this.enabled !== true) {
            return false;
        }

        // TODO: LOCK THE GRID

        const best: [number, Array<[Tile, Tile]>] = [-1, []]; // origin, destination, points

        // for each tile
        this.grid.tiles.forEach((t: Tile) => {
            // check if we can use it
            if ((this.player === Player.Red && t.value === TileValue.Red) ||
                (this.player === Player.Blue && t.value === TileValue.Blue)) {

                // neighbor
                t.neighbors[1].forEach((n) => {
                    if (n.value === TileValue.Empty) {
                        let pointsn: number = 1;

                        n.neighbors[1].forEach((o: Tile) => {
                            if ((this.player === Player.Red && o.value === TileValue.Blue) ||
                                (this.player === Player.Blue && o.value === TileValue.Red)) {
                                pointsn++;
                            }
                        });

                        if (pointsn > best[0]) {
                            best[0] = pointsn;
                            best[1] = [[t, n]];
                        } else if (pointsn === best[0]) {
                            best[1].push([t, n]);
                        }
                    }
                });

                // remote
                t.neighbors[0].forEach((r) => {
                    if (r.value === TileValue.Empty) {
                        let pointsr: number = 0;

                        r.neighbors[1].forEach((y: Tile) => {
                            if ((this.player === Player.Red && y.value === TileValue.Blue) ||
                                (this.player === Player.Blue && y.value === TileValue.Red)) {
                                pointsr++;
                            }
                        });

                        if (pointsr > best[0]) {
                            best[0] = pointsr;
                            best[1] = [[t, r]];
                        } else if (pointsr === best[0]) {
                            best[1].push([t, r]);
                        }
                    }
                });

                // TODO: DRY this shit ^
            }
        });

        if (best[1].length < 1) {
            return false;
        }

        const move = Math.floor(Math.random() * best[1].length);

        best[1][move][0].neighbors[0].forEach((n: Tile) => {
            if (n.value === TileValue.Empty) {
                n.color = (this.player ? TileColor.BlueRemote : TileColor.RedRemote);
            }
        });
        best[1][move][0].neighbors[1].forEach((n: Tile) => {
            if (n.value === TileValue.Empty) {
                n.color = (this.player ? TileColor.BlueNeighbor : TileColor.RedNeighbor);
            }
        });
        this.grid.active = best[1][move][0];
        this.grid.node.dispatchEvent(new CustomEvent("cell_click", {detail: best[1][move][1].id}));
        return true;
    }
}





const nodes: Map<string, HTMLElement> = new Map();

Object.entries({
    grid:       ".grid",
    load:       ".load > select",
    menu:       ".menu",
    redo:       "button.redo",
    save:       ".save > select",
    status:     ".status",
    undo:       "button.undo",
    player:     ".player",
    red:        ".red",
    blue:       ".blue",
    perma:      "a.perma",
    switch:     "button.switch",
    layout:     ".layout",
    pick:       ".layout > select",
    new:        ".layout > button",
    caching:    ".online",
    cpu:        ".cpu > label > input",
}).forEach((v: [string, string]) => {
    const node: HTMLElement = document.querySelector(v[1]);
    if (node === null) {
        throw new Error(`Node not found in document! => "${v[1]}"`);
    }
    nodes.set(v[0], node);
});


const grid: Grid = new Grid(nodes.get("grid"));

const layouts: Array<[string, string]> = Object.entries({
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
    "gumi 19": "0000000000011100055101000501555005551050001015500011100000000000",
    "gumi 20": "0000000005100510015001500000000000000000051005100150015000000000",
    "Tirifto 01": "5000000104044040040000400000000000144500000000000004400000400400",
    "Tirifto 02": "0004500004000040004004001000000440000001004004000400004000054000",
    "Tirifto 03": "4440044445000014404004040000000000000000404004044100005444400444",
    "Tirifto 04": "0001100000044000000000001400004514000045000000000004400000055000",
    "Tirifto 05": "4100005414000045000000000000000000000000000000005400004145000014",
    "Tirifto 06": "4000000401000050004444000040040000400400004444000500001040000004",
    "Tirifto 07": "0140045014000045400040040040000000000400400400045400004105400410",
    "Tirifto 08": "0050500405050000505004000500000150000010004001010000101040010100",
});

let _current_player: Player = Player.Red;
let _right_click_tile: Tile = null;
const cpu: CPU = new CPU(grid);

const _move_history: [Uint8Array[], Uint8Array[]] = [[], []]; // undo, redo

interface Savestate {
    tiles: string;
    undo: string[];
    redo: string[];
    player: Player;
}

const savestates: Savestate[] = [];

const new_game = (layout: number | string = Math.floor(Math.random() * layouts.length),
                  player: Player = Math.round(Math.random())): void => {

    if (typeof layout === "number") {
        layout = layouts[layout][1];
    }

    layout.split("").forEach((v: string, k: number): TileValue => grid.tiles[k].value = +v);
    grid.apply();
    undo_history.length = 0;
    redo_history.length = 0;
    current_player = +player;

    cpu.player = current_player === Player.Blue ? Player.Red : Player.Blue;
};

const save_click = (slot: number|Event) => {
    if (typeof slot !== "number") {
        slot = (nodes.get("save") as HTMLSelectElement).selectedIndex;
    }

    if (slot < 1) {
        return;
    }

    (nodes.get("save") as HTMLSelectElement).selectedIndex = 0;

    savestates[slot - 1] = {
        tiles: grid.tiles.map((t: Tile) => t.value).join(""),
        undo: undo_history.map((t: Uint8Array) => Array.prototype.join.call(t, "")),
        redo: redo_history.map((t: Uint8Array) => Array.prototype.join.call(t, "")),
        player: +current_player,
    };

    const compressed: Array<(number | Array<(string | string[])>)> = savestates.map(
        (t: Savestate): Array<(string | string[])> => Object.values(t));
    compressed.unshift(SAVESTATE_VERSION); // formatting version

    localStorage.setItem("savestate", JSON.stringify(compressed));
    nodes.get("status").textContent = "saved to slot " + slot;
};

const load_click = (slot: number|Event) => {
    if (typeof slot !== "number") {
        slot = (nodes.get("load") as HTMLSelectElement).selectedIndex;
    }

    if (slot < 1) {
        return;
    }

    (nodes.get("load") as HTMLSelectElement).selectedIndex = 0;

    if (!((slot - 1) in savestates) || savestates[slot - 1] === null) {
        nodes.get("status").textContent = "slot " + slot + " is empty";
        return;
    }

    undo_history.length = 0;
    redo_history.length = 0;

    savestates[slot - 1].tiles.split("").forEach((v: string, k: number) => grid.tiles[k].value = +v as TileValue);
    savestates[slot - 1].undo.forEach((v: string) => {
        undo_history.push(Uint8Array.from(v.split("").map((n: string) => +n)));
    });
    savestates[slot - 1].redo.forEach((v: string) => {
        redo_history.push(Uint8Array.from(v.split("").map((n: string) => +n)));
    });

    grid.apply();
    current_player = +savestates[slot - 1].player;

    nodes.get("status").textContent = "loaded slot " + slot;
};

const undo_history: Uint8Array[] = new Proxy(_move_history[0], {
    set: (target: Uint8Array[], name: number, value: Uint8Array) => {
        target[name] = value;
        (nodes.get("undo") as HTMLButtonElement).disabled = (target.length < 1);
        return true;
    },
});

const redo_history: Uint8Array[] = new Proxy(_move_history[1], {
    set: (target: Uint8Array[], name: number, value: Uint8Array) => {
        target[name] = value;
        (nodes.get("redo") as HTMLButtonElement).disabled = (target.length < 1);
        return true;
    },
});


declare let current_player: Player;
Reflect.defineProperty(self, "current_player", {
    get: () => _current_player,
    set: (v: Player) => {
        grid.node.classList.remove("p" + _current_player);
        grid.node.classList.add("p" + v);
        nodes.get("player").textContent = "(none)";
        nodes.get("blue").textContent = String(grid.blue_tiles);
        nodes.get("red").textContent = String(grid.red_tiles);

        history.replaceState({}, document.title, "#" + grid.tiles.map((t) => t.value).join("") + v);
        (nodes.get("perma") as HTMLAnchorElement).href = document.location.href;

        if (grid.free_tiles < 1) {
            grid.node.className = "grid";
            (nodes.get("switch") as HTMLButtonElement).disabled = true;
            nodes.get("layout").classList.add("endgame");

            if (grid.red_tiles > grid.blue_tiles) {
                nodes.get("status").textContent = "red wins";
            } else if (grid.blue_tiles > grid.red_tiles) {
                nodes.get("status").textContent = "blue wins";
            } else {
                nodes.get("status").textContent = "draw";
            }
        } else {
            nodes.get("status").textContent = "game in progress";
            nodes.get("player").textContent = v ? "blue" : "red";
            (nodes.get("switch") as HTMLButtonElement).disabled = false;
            nodes.get("layout").classList.remove("endgame");
        }

        _current_player = v;
    },
});

declare let right_click_tile: Tile;
Reflect.defineProperty(self, "right_click_tile", {
    get: () => _right_click_tile,
    set: (tile: Tile) => {
        if (tile === null) {
            nodes.get("menu").style.display = "none";
        }
        _right_click_tile = tile;
    },
});


grid.node.addEventListener("cell_click", (e: Event & {detail: number}) => {
    if (grid.free_tiles < 1) {
        return;
    }

    const tile: Tile = grid.tiles[e.detail];
    const contaminate = () => {
            let can_move: boolean = false;
            let red_can_move: boolean = false;
            let blue_can_move: boolean = false;

            const claim_free = (p: Player) => {
                    grid.tiles.forEach((t: Tile) => {
                        if (t.value === TileValue.Empty) {
                            t.value = (p === Player.Blue) ? TileValue.Blue : TileValue.Red;
                        }
                    });
                };

            tile.value = (current_player ? TileValue.Blue : TileValue.Red); // contaminate center
            tile.neighbors[1].forEach((t: Tile) => {
                if (t.value === (current_player ? TileValue.Red : TileValue.Blue)) {
                    t.value = (current_player ? TileValue.Blue : TileValue.Red);
                }
            }); // contaminate adjacent tiles

            if (grid.red_tiles < 1) {
                claim_free(Player.Blue);
                return;
            } else if (grid.blue_tiles < 1) {
                claim_free(Player.Red);
                return;
            }

            grid.tiles.forEach((t: Tile) => {
                if (red_can_move && blue_can_move) {
                    return;
                }

                if (t.value === TileValue.Red || t.value === TileValue.Blue) {
                    can_move = [...t.neighbors[0], ...t.neighbors[1]].some((r: Tile) => r.value === TileValue.Empty);

                    if (can_move && t.value === TileValue.Red) {
                        red_can_move = true;
                    } else if (can_move && t.value === TileValue.Blue) {
                        blue_can_move = true;
                    }
                }
            });

            if (!red_can_move) {
                claim_free(Player.Blue);
            } else if (!blue_can_move) {
                claim_free(Player.Red);
            }
        };


    if (right_click_tile !== null) {
        right_click_tile = null;
    }

    if (grid.active !== null && tile !== grid.active &&
        tile.color !== (current_player ? TileColor.BlueNeighbor : TileColor.RedNeighbor) &&
        tile.color !== (current_player ? TileColor.BlueRemote : TileColor.RedRemote)) {
        grid.apply(); // implicitly removes active
    }

    switch (tile.color) {
        case TileColor.Red:
        case TileColor.RedNeighbor:
        case TileColor.RedRemote:
            if (current_player !== Player.Red) {
                return;
            }
            break;
        case TileColor.Blue:
        case TileColor.BlueNeighbor:
        case TileColor.BlueRemote:
            if (current_player !== Player.Blue) {
                return;
            }
            break;
        default: return;
    }

    if (grid.active !== null) {
        if (tile !== grid.active && ([TileColor.RedNeighbor, TileColor.RedRemote, TileColor.BlueNeighbor,
            TileColor.BlueRemote] as TileColor[]).includes(tile.color)) {
            redo_history.length = 0; // empty redo history
            undo_history.push(Uint8Array.from(grid.tiles.map((t) => t.value))); // push to undo history

            if (tile.color === TileColor.RedRemote || tile.color === TileColor.BlueRemote) {
                grid.active.value = TileValue.Empty; // remove from origin
            }

            contaminate();

            current_player = current_player === Player.Blue ? Player.Red : Player.Blue; // switch & calculate tiles

            if (cpu.play_once()) {
                return;
            }
        }

        grid.apply();

        return;
    }

    if (tile.value !== TileValue.Red && tile.value !== TileValue.Blue) {
        return;
    }

    grid.active = tile;
    tile.neighbors[0].forEach((n: Tile) => {
        if (n.value === TileValue.Empty) {
            n.color = (current_player ? TileColor.BlueRemote : TileColor.RedRemote);
        }
    });
    tile.neighbors[1].forEach((n: Tile) => {
        if (n.value === TileValue.Empty) {
            n.color = (current_player ? TileColor.BlueNeighbor : TileColor.RedNeighbor);
        }
    });
}, false);

grid.node.addEventListener("cell_rclick", (v: Event & {detail: [MouseEvent, number]}) => {
    v.detail[0].preventDefault();
    v.detail[0].stopPropagation();
    v.stopPropagation();

    nodes.get("menu").style.left = v.detail[0].clientX + "px";
    nodes.get("menu").style.top = v.detail[0].clientY + "px";
    nodes.get("menu").style.display = "block";
    right_click_tile = grid.tiles[v.detail[1]];

    if (grid.active !== null) {
        grid.apply();
    }
}, false);

nodes.get("menu").addEventListener("click", (e: Event) => {
    if ("v" in (e.target as HTMLElement).dataset && right_click_tile !== null) {
        right_click_tile.value = parseInt((e.target as HTMLElement).dataset.v, 10);
        right_click_tile.color = right_click_tile.value as number;
        current_player += 0; // just to calculate tiles
    }

    right_click_tile = null;
}, false);

document.addEventListener("click", (e: MouseEvent & {path: NodeList}) => {
    // TODO: use Event.deepPath in the future
    if (right_click_tile !== null && !Array.prototype.includes.call(e.path, nodes.get("menu"))) {
        right_click_tile = null;
    }

    if (grid.active !== null && !Array.prototype.includes.call(e.path, grid._tbl)) {
        grid.apply();
    }
}, false);

nodes.get("switch").addEventListener("click", () => {
    current_player = current_player === Player.Blue ? Player.Red : Player.Blue;
    return;
}, false);

nodes.get("undo").addEventListener("click", () => {
    if (undo_history.length < 1) {
        return;
    }

    redo_history.push(Uint8Array.from(grid.tiles.map((t) => t.value))); // push to redo history
    Array.prototype.forEach.call(undo_history.pop(), (v: TileValue, k: number) => grid.tiles[k].value = v);
    grid.apply();
    current_player = current_player === Player.Blue ? Player.Red : Player.Blue;

}, false);

nodes.get("redo").addEventListener("click", () => {
    if (redo_history.length < 1) {
        return;
    }

    undo_history.push(Uint8Array.from(grid.tiles.map((t) => t.value))); // push to undo history
    Array.prototype.forEach.call(redo_history.pop(), (v: TileValue, k: number) => grid.tiles[k].value = v);
    grid.apply();
    current_player = current_player === Player.Blue ? Player.Red : Player.Blue;

}, false);

nodes.get("new").addEventListener("click", () => {
    const layout = (nodes.get("pick") as HTMLSelectElement).selectedIndex - 1;
    if (layout < 0) {
        new_game();
    } else {
        new_game(layout);
    }
}, false);

self.addEventListener("hashchange", (e) => {
    if (e.isTrusted && (new RegExp("^#[0145]{" + grid.num_tiles + "}[01]{1}$")).test(document.location.hash)) {
        new_game(document.location.hash.slice(1, -1), +document.location.hash.slice(-1));
    }
}, false);

nodes.get("perma").addEventListener("click", (e) => {
    let success: boolean = false;
    const range: Range = document.createRange();
    const before: string = nodes.get("status").textContent;

    e.preventDefault();
    e.stopPropagation();

    self.getSelection().removeAllRanges(); // remove any leftovers
    nodes.get("status").textContent = document.location.href; // change status to the url

    try {
        range.selectNode(nodes.get("status")); // add status to the range
        self.getSelection().addRange(range); // make the browser select the range
        success = document.execCommand("copy");
    } catch (r) {
        success = false;
    }

    self.getSelection().removeAllRanges(); // unselect

    nodes.get("status").textContent = success ? "copied to clipboard" : before;

    if ("share" in navigator) {
        (navigator as Navigator & {share: any}).share({ // tslint:disable-line
            title: document.title,
            text: "Contagion board editor",
            url: self.location.href,
        }).then(() => {
            nodes.get("status").textContent = "successful share";
        }).catch((error: {}) => {
            console.error(error);
        });
    }
}, false);

nodes.get("cpu").addEventListener("change", (e) => {
    cpu.enabled = (e.target as HTMLInputElement).checked;
    if (cpu.enabled) {
        localStorage.setItem("CPU", JSON.stringify([cpu.enabled]));
    } else {
        localStorage.removeItem("CPU");
    }
});

nodes.get("save").addEventListener("change", save_click, false);
nodes.get("load").addEventListener("change", load_click, false);

document.addEventListener("keyup", (e) => {
    let reg: RegExpExecArray;

    if (!e.isTrusted) {
        return;
    }

    reg = /^(?:Digit|Numpad)(\d)$/.exec(e.code);

    if (reg !== null) {
        const num: number = parseInt(reg[1], 10);

        if (num < 1) {
            new_game();
        } else {
            if (e.shiftKey) {
                save_click(num);
            } else {
                load_click(num);
            }
        }
    }
}, false);




layouts.forEach((layout) => {
    const l = document.createElement("option");
    l.textContent = layout[0];
    nodes.get("pick").appendChild(l);
});

if ((new RegExp("^#[0145]{" + grid.num_tiles + "}[01]{1}$")).test(document.location.hash)) {
    new_game(document.location.hash.slice(1, -1), +document.location.hash.slice(-1));
} else {
    new_game();
}

if ("savestate" in localStorage) {
    savestates.length = 0; // forcefully empty it
    // tslint:disable-next-line:no-any
    const tmpsav: any[] = JSON.parse(localStorage.getItem("savestate")); // tslint doesn't like [number, Savestate[]]
    const ver: number = tmpsav.shift();

    tmpsav.forEach((s: [string, string[], string[], Player]) => {
        savestates.push(s !== null ? {
            tiles: s[0],
            undo: s[1],
            redo: s[2],
            player: s[3],
        } as Savestate : null);
    });

    if (savestates.length < 1 || typeof ver !== "number" || ver !== SAVESTATE_VERSION) {
        console.warn("Dropping empty or invalid savestate", Array.from(tmpsav));
        savestates.length = 0; // forcefully empty it
        localStorage.removeItem("savestate");
    }
}

if ("CPU" in localStorage) {
    const state: boolean = JSON.parse(localStorage.getItem("CPU"))[0];
    cpu.enabled = state;
    (nodes.get("cpu") as HTMLInputElement).checked = state;
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("service-worker.js")
        .then(() => {
            console.log("Service Worker Registered");
            nodes.get("caching").textContent = "Available offline";
            nodes.get("caching").className = "offline";
        })
        .catch(() => console.warn("Service Worker Unavailable"));
} else {
    console.warn("Navigator does not support Service Workers");
}
