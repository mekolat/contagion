 (function(){
    "use strict";

    class Grid {
        constructor(node, size=8) {
            this.size = size; // board size (size * size)
            this.num_tiles = size ** 2; // total number of tiles
            this.free_tiles = this.num_tiles; // number of free tiles
            this.red_tiles = 0; // number of red tiles
            this.blue_tiles = 0; // number of blue tiles
            this.node = node; // the grid node
            this.tiles = new Array(this.num_tiles); // array containing all Tile()
            this._active = null; // the highlighted tile
            this.make_table();
        }

        apply() {
            this.tiles.forEach(tile => tile.color = tile.value);
            this.active = null;
        }

        get active() {
            return this._active;
        }

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

        make_table() {
            let e = 0,
                tbl  = document.createElement("table");

            for(let i = 0; i < this.size; i++){
                let tr = tbl.insertRow();
                for(let j = 0; j < this.size; j++){
                    this.tiles[e] = new Tile(this, e++, tr);
                }
            }

            this.node.appendChild(tbl);
        }
    }

    class Tile {
        constructor(parent, id, tr) {
            this.id = id;
            this.parent = parent; // grid
            this.rpos = id % this.parent.size; // position in row
            this.cpos = Math.floor(id / this.parent.size); // position in column
            this.node = tr.insertCell(); // DOM element
            this._color = 0; // highlight color
            this._value = 0; // actual value

            this.node.addEventListener("click", () => this.parent.node.dispatchEvent(new CustomEvent("cell_click", {detail: this.id})), false);
            this.node.addEventListener("contextmenu", e => this.parent.node.dispatchEvent(new CustomEvent("cell_rclick", {detail: [e, this.id]})), false);
        }

        get color() {
            return this._color;
        }

        set color(c) {
            c = Math.max(0, Math.min(c, 7));
            if (this._color !== c)
            {
                this.node.className = "c_" + c;
                this._color = c;
            }
        }

        get value() {
            return this._value;
        }

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

        get neighbors() {
            let n = [new Set(), new Set()];

            // remotes
            if (this.id - (this.parent.size * 2) >= 0)
                n[0].add(this.parent.tiles[this.id - (this.parent.size * 2)]);
            if (this.id - 2 >= 0 && this.rpos > 1)
                n[0].add(this.parent.tiles[this.id - 2]);
            if (this.id + 2 < this.parent.num_tiles && this.rpos < (this.parent.size - 2))
                n[0].add(this.parent.tiles[this.id + 2]);
            if (this.id + (this.parent.size * 2) < this.parent.num_tiles)
                n[0].add(this.parent.tiles[this.id + (this.parent.size * 2)]);

            // siblings
            if (this.id - (this.parent.size + 1) >= 0 && this.rpos > 0)
                n[1].add(this.parent.tiles[this.id - (this.parent.size + 1)]);
            if (this.id - this.parent.size >= 0)
               n[1].add(this.parent.tiles[this.id - this.parent.size]);
            if (this.id - (this.parent.size - 1) >= 0 && this.rpos < (this.parent.size - 1))
                n[1].add(this.parent.tiles[this.id - (this.parent.size - 1)]);
            if (this.id - 1 >= 0 && this.rpos > 0)
                n[1].add(this.parent.tiles[this.id - 1]);
            if (this.id + 1 < this.parent.num_tiles && this.rpos < (this.parent.size - 1))
                n[1].add(this.parent.tiles[this.id + 1]);
            if (this.id + (this.parent.size - 1) < this.parent.num_tiles && this.rpos > 0)
                n[1].add(this.parent.tiles[this.id + (this.parent.size - 1)]);
            if (this.id + this.parent.size < this.parent.num_tiles)
                n[1].add(this.parent.tiles[this.id + this.parent.size]);
            if (this.id + (this.parent.size + 1) < this.parent.num_tiles && this.rpos < (this.parent.size - 1))
                n[1].add(this.parent.tiles[this.id + (this.parent.size + 1)]);

            return n;
        }
    }


    // on init
    const $ = document.querySelector.bind(document),
        $$ = document.querySelectorAll.bind(document),
        grid = new Grid($(".grid"));





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


    let _current_player = 0,
        _right_click_tile = null;

    const _move_history = [[], []], // undo, redo
        savestate = [2],
        new_game = (layout = Math.floor(Math.random()*layouts.length),
                    player = Math.round(Math.random())) => {

            if (typeof layout === "number")
                layout = layouts[layout][1];

            Uint8Array.from(layout).forEach((v, k) => grid.tiles[k].value = v);
            grid.apply();
            undo_history.length = 0;
            redo_history.length = 0;
            current_player = player|0;
        },
        save_click = slot => {
            if (typeof slot !== "number")
                slot = $(".save > select").selectedIndex;

            if (slot < 1)
                return;

            $(".save > select").selectedIndex = 0;

            savestate[slot] = [
                grid.tiles.map(t => t.value).join(""),
                undo_history.map(t => t.join("")),
                redo_history.map(t => t.join("")),
                Boolean(current_player)|0,
            ];

            localStorage.setItem("savestate", JSON.stringify(savestate));
            $(".status").innerText = "saved to slot " + slot;
        },
        load_click = slot => {
            if (typeof slot !== "number")
                slot = $(".load > select").selectedIndex;

            if (slot < 1)
                return;

            $(".load > select").selectedIndex = 0;

            if (!(slot in savestate) || savestate[slot] === null)
            {
                $(".status").innerText = "slot " + slot + " is empty";
                return;
            }

            undo_history.length = 0;
            redo_history.length = 0;
            Uint8Array.from(savestate[slot][0]).forEach((v, k) => grid.tiles[k].value = v);
            savestate[slot][1].forEach(v => undo_history.push(Uint8Array.from(v)));
            savestate[slot][2].forEach(v => redo_history.push(Uint8Array.from(v)));

            grid.apply();
            current_player = Boolean(savestate[slot][3])|0;

            $(".status").innerText = "loaded slot " + slot;
        },
        undo_history = new Proxy(_move_history[0], {
            set: (target, name, value) => {
                target[name] = value;
                $(".undo").disabled = (target.length < 1);
                return true;
            }
        }),
        redo_history = new Proxy(_move_history[1], {
            set: (target, name, value) => {
                target[name] = value;
                $(".redo").disabled = (target.length < 1);
                return true;
            }
        });

    Reflect.defineProperty(self, "current_player", {
        get: () => _current_player,
        set: v => {
            grid.node.classList.remove("p" + _current_player);
            grid.node.classList.add("p" + v);
            $(".info .player").innerText = "(none)";
            $(".info .score.blue").innerText = grid.blue_tiles;
            $(".info .score.red").innerText = grid.red_tiles;

            history.replaceState({}, document.title, "#" + grid.tiles.map(t => t.value).join("") + v);
            $(".perma").href = document.location.href;

            if (grid.free_tiles < 1)
            {
                grid.node.className = "grid";
                $(".switch").disabled = true;
                $(".layout").classList.add("endgame");

                if (grid.red_tiles > grid.blue_tiles)
                    $(".info .status").innerText = "red wins";
                else if (grid.blue_tiles > grid.red_tiles)
                    $(".info .status").innerText = "blue wins";
                else
                    $(".info .status").innerText = "draw";
            }
            else
            {
                $(".info .status").innerText = "game in progress";
                $(".info .player").innerText = v ? "blue" : "red";
                $(".switch").disabled = false;
                $(".layout").classList.remove("endgame");
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

                $(".menu").style.left = v.detail[0].clientX + "px";
                $(".menu").style.top = v.detail[0].clientY + "px";
                $(".menu").style.display = "block";
                v = grid.tiles[v.detail[1]];

                if (grid.active !== null)
                    grid.apply();
            }

            else
                $(".menu").style.display = "none";

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

    grid.node.addEventListener("cell_rclick", e => right_click_tile = e, false);

    $(".menu").addEventListener("click", e => {
        if ("v" in e.target.dataset && right_click_tile !== null)
        {
            right_click_tile.value = parseInt(e.target.dataset.v, 10);
            right_click_tile.color = right_click_tile.value;
            current_player |= 0; // just to calculate tiles
        }

        right_click_tile = null;
    }, false);

    document.addEventListener("click", e => {
        if (right_click_tile !== null && !e.path.includes($(".menu")))
            right_click_tile = null;

        if (grid.active !== null && !e.path.includes($(".grid table")))
            grid.apply();
    }, false);

    $(".switch").addEventListener("click", () => current_player ^= 1, false);

    $(".undo").addEventListener("click", () => {
        if (undo_history.length < 1)
            return;

        redo_history.push(Uint8Array.from(grid.tiles.map(t => t.value))); // push to redo history
        undo_history.pop().forEach((v, k) => grid.tiles[k].value = v);
        grid.apply();
        current_player ^= 1;

    }, false);

    $(".redo").addEventListener("click", () => {
        if (redo_history.length < 1)
            return;

        undo_history.push(Uint8Array.from(grid.tiles.map(t => t.value))); // push to undo history
        redo_history.pop().forEach((v, k) => grid.tiles[k].value = v);
        grid.apply();
        current_player ^= 1;

    }, false);

    $(".layout > button").addEventListener("click", () => {
        let layout = $(".layout > select").selectedIndex - 1;
        if (layout < 0)
            new_game();
        else
            new_game(layout);
    }, false);

    self.addEventListener("hashchange", e => {
        if (e.isTrusted && (new RegExp("^#[0145]{"+ grid.num_tiles +"}[01]{1}$")).test(document.location.hash))
            new_game(document.location.hash.slice(1, -1), document.location.hash.slice(-1));
    }, false);

    $(".perma").addEventListener("click", e => {
        let success = false,
            range = document.createRange(),
            before = $(".status").innerText;

        e.preventDefault();
        e.stopPropagation();

        self.getSelection().removeAllRanges(); // remove any leftovers
        $(".status").innerText = document.location.href; // change status to the url

        try {
            range.selectNode($(".status")); // add status to the range
            self.getSelection().addRange(range); // make the browser select the range
            success = document.execCommand('copy');
        } catch(r) {
            success = false;
        }

        self.getSelection().removeAllRanges(); // unselect

        if (success)
            $(".status").innerText = "copied to clipboard";
        else
            $(".status").innerText = before;
    }, false);

    $(".save > select").addEventListener("change", save_click, false);
    $(".load > select").addEventListener("change", load_click, false);

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
        $(".layout > select").appendChild(l);
    });

    if ((new RegExp("^#[0145]{"+ grid.num_tiles +"}[01]{1}$")).test(document.location.hash))
        new_game(document.location.hash.slice(1, -1), document.location.hash.slice(-1));
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
                $(".online").innerText = "Available offline";
                $(".online").className = "offline";
            })
            .catch(() => console.warn("Service Worker Unavailable"));
    }
    else
        console.warn("Navigator does not support Service Workers");

    console.info("🥚 %cThis application does not contain easter eggs", "font-weight:bolder;font-size:1.2em");
})();
