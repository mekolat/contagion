(function(){
    "use strict";
    var $ = document.querySelector.bind(document),
        $$ = document.querySelectorAll.bind(document),
        tiles = new Uint8Array(64),
        cells,
        current_player = 0,
        active_tile = -1,
        red_tiles = 0,
        blue_tiles = 0,
        free_tiles = 64,
        right_click_id = -1,
        move_history = {undo: [], redo: []},
        savestate = [],
        layouts = [
                    "1000000500000000000000000000000000000000000000000000000050000001", // gumi (01)
                    "1400004544000044000000000000000000000000000000004400004414000045", // gumi (02)
                    "1000000004400000040000000000000000000000000000400000044000000005", // gumi (03)
                    "5040040500400400440000440000000000000000440000440040040010400401", // gumi (04)
                    "0000000000000000004004001004400510044005004004000000000000000000", // gumi (05)
                    "0000000004000040100440050040040000400400100440050400004000000000", // gumi (06)
                    "0000000004000040004554000004400000044000004114000400004000000000", // gumi (07)
                    "1004400500044000000440000000000000000000000440000004400050044001", // gumi (08)
                    "0000000000000000000110000044440000444400000550000000000000000000", // gumi (09)
                    "4004400440044004040000401400004514000045040000404004400440044004", // gumi (10)
                    "1000005001000005100000500100000510000050010000051000005001000005", // gumi (11)
                    "1000000504400440044004400004400000044000044004400440044050000001", // gumi (12)
                    "0000000000400400044114400054450000544500044114400040040000000000", // gumi (13)
                    "5004400100000000004004004000000440000004004004000000000010044005", // gumi (14)
                    "5000000104044040040000400000000000144500000000000004400000400400", // Tirifto (01)
                    "0004500004000040004004001000000440000001004004000400004000054000", // Tirifto (02)
                    "4440044445000014404004040000000000000000404004044100005444400444", // Tirifto (03)
                    "0001100000044000000000001400004514000045000000000004400000055000", // Tirifto (04)
                    "4100005414000045000000000000000000000000000000005400004145000014", // Tirifto (05)
                    "4000000401000050004444000040040000400400004444000500001040000004", // Tirifto (06)
                    "0140045014000045400040040040000000000400400400045400004105400410", // Tirifto (07)
                    "0050500405050000505004000500000150000010004001010000101040010100", // Tirifto (08)
                  ];

    function set_cell(cell, val = 0) {
        cell = cells[cell];
        cell.className = "c_" + val;
    }

    function set_tile(tile, val = 0) {
        if (tiles[tile] === val)
            return;

        if (tiles[tile] === 1)
            red_tiles--;
        else if (tiles[tile] === 5)
            blue_tiles--;
        else if (tiles[tile] === 0)
            free_tiles--;

        tiles[tile] = val;

        if (val === 1)
            red_tiles++;
        else if (val === 5)
            blue_tiles++;
        else if (val === 0)
            free_tiles++;
    }

    function apply_tiles() {
        [].forEach.call(cells, function(cell, index){
            set_cell(index, tiles[index]);
        });

        active_tile = -1;
    }

    function look_around(id, mode = 0)
    {
        // mode 0 = check move, 1 = highlight, 2 = contaminate
        var rpos = id % 8,
            cpos = Math.floor(id / 8),

            nn = id - 16, // north 2
            nw = id - 9, // north-west
            n = id - 8, // north
            ne = id - 7, // north-east
            ww = id - 2, // west 2
            w = id - 1, // west
            e = id + 1, // east
            ee = id + 2, // east 2
            sw = id + 7, // south-west
            s = id + 8, // south
            se = id + 9, // south-east
            ss = id + 16; // south 2;


        if (mode !== 2)
        {
            // extremities
            if (nn >= 0 && tiles[nn] === 0)
            {
                if (mode === 0)
                    return true;
                set_cell(nn, current_player ? 7 : 3);
            }
            if (ww >= 0 && rpos > 1 && tiles[ww] === 0)
            {
                if (mode === 0)
                    return true;
                set_cell(ww, current_player ? 7 : 3);
            }
            if (ee < 64 && rpos < 6 && tiles[ee] === 0)
            {
                if (mode === 0)
                    return true;
                set_cell(ee, current_player ? 7 : 3);
            }
            if (ss < 64 && tiles[ss] === 0)
            {
                if (mode === 0)
                    return true;
                set_cell(ss, current_player ? 7 : 3);
            }
        }

        else
            set_tile(id, current_player ? 5 : 1); // contaminate the center


        // adjacent
        if (nw >= 0 && rpos > 0)
        {
            if (tiles[nw] === (current_player ? 1 : 5) && mode === 2)
                set_tile(nw, current_player ? 5 : 1); // contaminate the tile
            else if (tiles[nw] === 0)
            {
                if (mode === 0)
                    return true;
                set_cell(nw, current_player ? 6 : 2);
            }
        }
        if (n >= 0)
        {
            if (tiles[n] === (current_player ? 1 : 5) && mode === 2)
                set_tile(n, current_player ? 5 : 1); // contaminate the tile
            else if (tiles[n] === 0)
            {
                if (mode === 0)
                    return true;
                set_cell(n, current_player ? 6 : 2);
            }
        }
        if (ne >= 0 && rpos < 7)
        {
            if (tiles[ne] === (current_player ? 1 : 5) && mode === 2)
                set_tile(ne, current_player ? 5 : 1); // contaminate the tile
            else if (tiles[ne] === 0)
            {
                if (mode === 0)
                    return true;
                set_cell(ne, current_player ? 6 : 2);
            }
        }
        if (w >= 0 && rpos > 0)
        {
            if (tiles[w] === (current_player ? 1 : 5) && mode === 2)
                set_tile(w, current_player ? 5 : 1); // contaminate the tile
            else if (tiles[w] === 0)
            {
                if (mode === 0)
                    return true;
                set_cell(w, current_player ? 6 : 2);
            }
        }
        if (e < 64 && rpos < 7)
        {
            if (tiles[e] === (current_player ? 1 : 5) && mode === 2)
                set_tile(e, current_player ? 5 : 1); // contaminate the tile
            else if (tiles[e] === 0)
            {
                if (mode === 0)
                    return true;
                set_cell(e, current_player ? 6 : 2);
            }
        }
        if (sw < 64 && rpos > 0)
        {
            if (tiles[sw] === (current_player ? 1 : 5) && mode === 2)
                set_tile(sw, current_player ? 5 : 1); // contaminate the tile
            else if (tiles[sw] === 0)
            {
                if (mode === 0)
                    return true;
                set_cell(sw, current_player ? 6 : 2);
            }
        }
        if (s < 64)
        {
            if (tiles[s] === (current_player ? 1 : 5) && mode === 2)
                set_tile(s, current_player ? 5 : 1); // contaminate the tile
            else if (tiles[s] === 0)
            {
                if (mode === 0)
                    return true;
                set_cell(s, current_player ? 6 : 2);
            }
        }
        if (se < 64 && rpos < 7)
        {
            if (tiles[se] === (current_player ? 1 : 5) && mode === 2)
                set_tile(se, current_player ? 5 : 1); // contaminate the tile
            else if (tiles[se] === 0)
            {
                if (mode === 0)
                    return true;
                set_cell(se, current_player ? 6 : 2);
            }
        }

        return false;
    }

    function contaminate(id) {
        var can_move = false,
            red_can_move = false,
            blue_can_move = false;

        function claim_free(player) {
            for (let i = 0; i < 64 && free_tiles > 0; i++)
            {
                if (tiles[i] === 0)
                    set_tile(i, player ? 5 : 1);
            }
        }

        look_around(id, 2); // contaminate center + adjacent tiles

        if (red_tiles < 1)
        {
            claim_free(1);
            return;
        }
        else if (blue_tiles < 1)
        {
            claim_free(0);
            return;
        }

        for (let i = 0; i < 64 && (!red_can_move || !blue_can_move); i++)
        {
            if (tiles[i] === 1 || tiles[i] === 5)
            {
                can_move = look_around(i); // check if this pawn can move
                if (can_move === true && tiles[i] === 1)
                    red_can_move = true;
                else if (can_move === true && tiles[i] === 5)
                    blue_can_move = true;
            }
        }

        if (red_can_move === false)
        {
            claim_free(1);
            return;
        }
        else if (blue_can_move === false)
        {
            claim_free(0);
            return;
        }
    }

    function cell_click(e) {
        if (!("id" in e.target.dataset) || free_tiles < 1)
            return; // not a cell

        if (right_click_id >= 0)
        {
            right_click_id = -1;
            $(".menu").style.display = "none";
            return;
        }

        var id = parseInt(e.target.dataset.id, 10),
            state = parseInt(e.target.className.charAt(2), 10);

        if (active_tile >= 0 && active_tile !== id && state !== (current_player ? 6 : 2) && state !== (current_player ? 7 : 3))
        {
            apply_tiles();
        }

        switch (state)
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

        if (active_tile >= 0)
        {
            if (id !== active_tile && (state === 3 || state === 7))
            {
                // click remote tile
                move_history.undo.push(Array.from(tiles)); // log previous state so we can undo
                $(".undo").disabled = false; // we can undo
                move_history.redo = []; // empty redo
                $(".redo").disabled = true; // we can't redo

                set_tile(active_tile, 0); // remove from origin
                contaminate(id); // contaminate around new pawn
                apply_tiles(); // apply the changes
                next_turn(); // switch player
                return;
            }
            else if (id !== active_tile && (state === 2 || state === 6))
            {
                // click adjacent tile
                move_history.undo.push(Array.from(tiles)); // log previous state so we can undo
                $(".undo").disabled = false; // we can undo
                move_history.redo = []; // empty redo
                $(".redo").disabled = true; // we can't redo

                contaminate(id); // contaminate around new pawn
                apply_tiles(); // apply the changes
                next_turn(); // switch player
                return;
            }
            else if (id === active_tile)
            {
                // click same tile
                apply_tiles(); // reset board
                return;
            }
            else
            {
                // click other usable pawn
                apply_tiles(); // reset board
            }
        }

        active_tile = id;
        e.target.className += " active";
        look_around(id, 1);
    }

    function next_turn(real = true) {
        if (real)
            current_player = current_player ? 0 : 1;
        $(".grid").classList.add("p" + current_player);
        $(".grid").classList.remove("p" + (current_player ? 0 : 1));
        $(".info .player").innerText = "(none)";
        $(".info .score.blue").innerText = blue_tiles;
        $(".info .score.red").innerText = red_tiles;

        history.replaceState({}, document.title, "#" + tiles.join(""));
        $(".perma").href = document.location.href;

        if (free_tiles < 1)
        {
            $(".grid").className = "grid";
            $(".switch").disabled = true;
            $(".layout").classList.add("endgame");

            if (red_tiles > blue_tiles)
                $(".info .status").innerText = "red wins";
            else if (blue_tiles > red_tiles)
                $(".info .status").innerText = "blue wins";
            else
                $(".info .status").innerText = "draw";
        }
        else
        {
            $(".info .status").innerText = "game in progress";
            $(".info .player").innerText = current_player ? "blue" : "red";
            $(".switch").disabled = false;
            $(".layout").classList.remove("endgame");
        }
    }

    function new_game(layout = Math.floor(Math.random()*layouts.length),
                        player = Math.round(Math.random())) {
        let i = 0;
        if (typeof layout === "number")
            layout = layouts[layout];
        for (let tile of Uint8Array.from(layout))
        {
            set_tile(i, tile);
            i++;
        }

        current_player = player ? 1 : 0;
        apply_tiles(); // initial apply
        next_turn();
        move_history.undo = []; // empty the history
        move_history.redo = []; // empty the history
        $(".undo").disabled = true; // we can't undo
        $(".redo").disabled = true; // we can't redo
    }

    function new_click() {
        let layout = parseInt($(".layout > select").value, 10);
        if (layout < 0)
            new_game();
        else
            new_game(layout);
    }

    function right_click(e) {
        if (!("id" in e.target.dataset))
            return; // not a cell
        e.preventDefault();
        e.stopPropagation();

        right_click_id = parseInt(e.target.dataset.id, 10);
        $(".menu").style.left = e.clientX + "px";
        $(".menu").style.top = e.clientY + "px";
        $(".menu").style.display = "block";
        if (active_tile >= 0)
            apply_tiles();
    }

    function mod_click(e) {
        if ("v" in e.target.dataset && right_click_id >= 0)
        {
            set_tile(right_click_id, parseInt(e.target.dataset.v, 10));
            apply_tiles();
            next_turn(false); // just to count stuff
        }

        right_click_id = -1;
        $(".menu").style.display = "none";
    }

    function undo_click() {
        if (move_history.undo.length < 1)
            return;

        move_history.redo.push(Array.from(tiles)); // log so we can redo
        $(".redo").disabled = false; // we can redo


        let i = 0;
        for (let tile of move_history.undo.pop())
        {
            set_tile(i, tile);
            i++;
        }

        if (move_history.undo.length < 1)
            $(".undo").disabled = true; // we can't undo

        apply_tiles();
        next_turn();
    }

    function redo_click() {
        if (move_history.redo.length < 1)
            return;

        move_history.undo.push(Array.from(tiles)); // log so we can undo
        $(".undo").disabled = false; // we can undo


        let i = 0;
        for (let tile of move_history.redo.pop())
        {
            set_tile(i, tile);
            i++;
        }

        if (move_history.redo.length < 1)
            $(".redo").disabled = true; // we can't redo

        apply_tiles();
        next_turn();
    }

    function switch_click() {
        if (free_tiles < 1)
            return;
        apply_tiles(); // to remove highlight
        next_turn();
    }

    function save_click(slot) {
        if (typeof slot !== "number")
            slot = parseInt($(".save > select").value, 10);

        if (slot < 1)
            return;

        $(".save > select").value = 0;

        savestate[slot - 1] = {
            v: 1,
            tiles: Array.from(tiles),
            history: [
                Array.from(move_history.undo),
                Array.from(move_history.redo)
            ], player: current_player
        };

        localStorage.setItem("savestate", JSON.stringify(savestate));
        $(".status").innerText = "saved to slot " + slot;
    }

    function load_click(slot) {
        if (typeof slot !== "number")
            slot = parseInt($(".load > select").value, 10);

        if (slot < 1)
            return;

        $(".load > select").value = 0;

        if (!((slot - 1) in savestate) || savestate[slot - 1] === null)
        {
            $(".status").innerText = "slot " + slot + " is empty";
            return;
        }

        if (savestate[slot - 1].v !== 1)
        {
            $(".status").innerText = "incompatible version";
            return;
        }

        let i = 0;
        for (let tile of savestate[slot - 1].tiles)
        {
            set_tile(i, tile);
            i++;
        }

        current_player = savestate[slot - 1].player;
        move_history.undo = Array.from(savestate[slot - 1].history[0]);
        move_history.redo = Array.from(savestate[slot - 1].history[1]);

        $(".undo").disabled = move_history.undo.length > 0 ? false : true;
        $(".redo").disabled = move_history.redo.length > 0 ? false : true;

        apply_tiles();
        next_turn(false);

        $(".status").innerText = "loaded slot " + slot;
    }

    function perma_click(e) {
        let success = false,
            range = document.createRange(),
            before = $(".status").innerText;

        e.preventDefault();
        e.stopPropagation();

        window.getSelection().removeAllRanges(); // remove any leftovers
        $(".status").innerText = document.location.href; // change status to the url

        try {
            range.selectNode($(".status")); // add status to the range
            window.getSelection().addRange(range); // make the browser select the range
            success = document.execCommand('copy');
        } catch(r) {
            success = false;
        }

        window.getSelection().removeAllRanges(); // unselect

        if (success)
            $(".status").innerText = "copied to clipboard";
        else
            $(".status").innerText = before;
    }

    function key_press(e) {
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
    }

    function hash_change(e) {
        if (e.isTrusted && /^#[0145]{64}$/g.test(document.location.hash))
            new_game(document.location.hash.slice(1));
    }

// ON INIT

    // build table
    (function create_table(){
        var e = 0,
            tbl  = document.createElement("table");
        for(let i = 0; i < 8; i++){
            let tr = tbl.insertRow();
            for(let j = 0; j < 8; j++){
                let td = tr.insertCell();
                td.dataset.id = e++;
            }
        }
        tbl.addEventListener("click", cell_click, false);
        tbl.addEventListener("contextmenu", right_click, false);
        $(".grid").appendChild(tbl);
    })();

    cells = $$(".grid > table td");

    $(".switch").addEventListener("click", switch_click, false);
    $(".perma").addEventListener("click", perma_click, false);
    $(".layout > button").addEventListener("click", new_click, false);
    $(".save > select").addEventListener("change", save_click, false);
    $(".load > select").addEventListener("change", load_click, false);
    $(".undo").addEventListener("click", undo_click, false);
    $(".redo").addEventListener("click", redo_click, false);
    $(".menu").addEventListener("click", mod_click, false);
    window.addEventListener("hashchange", hash_change, false);
    document.addEventListener("keyup", key_press, false);

    if (/^#[0145]{64}$/g.test(document.location.hash))
        new_game(document.location.hash.slice(1));
    else
        new_game();

    if ("savestate" in localStorage)
        savestate = JSON.parse(localStorage.getItem("savestate"));

    // register the service worker
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("service-worker.js")
            .then(function(){
                console.info("Service Worker Registered");
                $(".online").innerText = "Available offline";
                $(".online").className = "offline";
            })
            .catch(function(){ console.warn("Service Worker Unavailable"); });
    }
    else
        console.warn("Navigator does not support Service Workers.");
})();
