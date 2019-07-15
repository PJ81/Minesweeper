
const EXPL = "💥", BOMB = "💣", TIME = "⏳", MARK = "⛔", WRONG = "❌",
DEAD = ["🤬", "🤮", "😭", "😡", "🤢", "😫", "💀", "🤡"], SMILE = "😃";

class MS {
    constructor() {
        this.width = 20;
        this.height = 14;
        this.mineField;
        this.clickFunction = (e) => {this.clickCell(e);};
        this.time;
        this.timer;
        this.mines;
        this.colors = ["#00a8c2", "#ef790d", "#0055a6", "#015f2d", "#de007b", "#f7000a", "#9f4708", "#633400"];
        document.getElementById("restart").addEventListener("click", () => {this.restart();}, false);
        this.restart();

        document.getElementById("field").oncontextmenu= (e) => {
            this.clickCell(e);
            return false;
        };
    }

    updateHud() {
        const t = document.getElementById("time"),
              i = document.getElementById("mines");
        const h = Math.floor(this.time / 3600),
              m = Math.floor((this.time - h * 3600) / 60),
              s = this.time - h * 3600 - m * 60;
        let tm = (h > 9 ? "" : "0") + h + ":" + 
                 (m > 9 ? "" : "0") + m + ":" +
                 (s > 9 ? "" : "0") + s;  
        t.innerHTML = TIME + tm;
        i.innerHTML = BOMB + this.mines;
    }

    getNeighboursCount(x, y) {
        let c = 0;
        for(let j = -1; j < 2; j++) {
            let b = y + j;
            if(b < 0 || b >= this.height) continue;
            for(let i = -1; i < 2; i++) {
                let a = x + i;
                if(a < 0 || a >= this.width || (i === 0 && j === 0)) continue;
                if(this.mineField[a + b * this.width].mine) c++;
            }
        }
        return c;
    }

    restart() {
        clearInterval(this.timer);
        //document.getElementById("msg").style.display = "none";
        document.getElementById("restart").innerHTML = SMILE;

        this.time = 0;
        this.mines = Math.floor((this.width * this.height) * .17);

        const brd = document.getElementById("board");
        brd.style.width = this.width * 56 + "px";

        this.mineField = [];
        const fld = document.getElementById("field");
        while(fld.childElementCount) {
            fld.removeChild(fld.childNodes[0]);
        }

        const m = document.createElement("div");
        m.id = "msg";
        fld.appendChild(m);

        const tmp = [];
        for(let y = 0; y < this.height; y++) {
            for(let x = 0; x < this.width; x++) {
                const d = document.createElement("div");
                d.className = "cellC";
                d.id = x + y * this.width;
                d.addEventListener("click", this.clickFunction, false)
                fld.appendChild(d);
                tmp.push(d.id);
                this.mineField.push({mine:false, closed:true, neighbours:0, elm:d, marked:false, x, y});
            }
        }

        for(let x = 0; x < this.mines; x++) {
            this.mineField[tmp.splice(Math.floor(Math.random() * tmp.length), 1)].mine = true;
        }

        for(let y = 0; y < this.mineField.length; y++) {
            if(!this.mineField[y].mine) {
                this.mineField[y].neighbours = this.getNeighboursCount(this.mineField[y].x, this.mineField[y].y);
            }
        }

        this.updateHud();
        this.timer = setInterval(() => {this.time++; this.updateHud();}, 1000);
    }

    openCells(x, y) {
        if(x < 0 || y < 0 || x >= this.width || y >= this.height) return;
        const c = this.mineField[x + y * this.width];
        if(!c.closed || c.mine || c.marked) return;
        c.elm.className = "cellO";
        c.elm.removeEventListener("click", this.clickFunction, false);
        c.closed = false;
        if(c.neighbours > 0) {
            c.elm.innerHTML = c.neighbours;
            c.elm.style.color = this.colors[c.neighbours - 1];
            return;
        }

        this.openCells(c.x - 1, c.y - 1);
        this.openCells(c.x    , c.y - 1);
        this.openCells(c.x + 1, c.y - 1);

        this.openCells(c.x - 1, c.y    );
        this.openCells(c.x + 1, c.y    );

        this.openCells(c.x - 1, c.y + 1);
        this.openCells(c.x    , c.y + 1);
        this.openCells(c.x + 1, c.y + 1);
    }

    checkEnd() {
        let cnt = this.mineField.length;
        for(let y = 0; y < this.mineField.length; y++) {
            if(!this.mineField[y].closed || (this.mineField[y].marked && this.mineField[y].mine)) cnt--;
        }
        if(cnt === this.mines) {
            this.mines = 0;
            this.updateHud();
            this.reveal(BOMB);
            const m = document.getElementById("msg");
            m.style.display = "block";
            m.innerHTML = "CONGRATULATIONS!"
        }
    }

    reveal(grfx) {
        const dead = grfx === EXPL;
        clearInterval(this.timer);
        for(let y = 0; y < this.mineField.length; y++) {
            this.mineField[y].elm.removeEventListener("click", this.clickFunction, false);
            this.mineField[y].elm.className = "cellO";
            
            if(this.mineField[y].mine) {
                this.mineField[y].elm.innerHTML = grfx;
            } else {
                if(dead && this.mineField[y].marked && !this.mineField[y].mine) {
                    this.mineField[y].elm.innerHTML = WRONG;
                } else if(this.mineField[y].neighbours > 0) {
                    this.mineField[y].elm.innerHTML = this.mineField[y].neighbours;
                    this.mineField[y].elm.style.color = this.colors[this.mineField[y].neighbours - 1];
                }
            }
        }
    }

    clickCell(e) {
        let elm = e.srcElement;
        if(e.button === 2) {
            if(this.mineField[elm.id].marked) {
                this.mineField[elm.id].marked = false;
                this.mines++;
                elm.innerHTML = "";
            } else {
                this.mineField[elm.id].marked = true;
                this.mines--;
                elm.innerHTML = MARK;
            }
            this.updateHud();
            return;
        } else {
            if(this.mineField[elm.id].marked) return;
            if(this.mineField[elm.id].mine) {
                this.reveal(EXPL);
                const brd = document.getElementById("field");
                brd.style.position = "relative";
                document.getElementById("restart").innerHTML = DEAD[Math.floor(Math.random() * DEAD.length)];
                let timerCnt = 0;
                const exp = setInterval(() => {
                    if((timerCnt++) > 80) {
                        clearInterval(exp);
                        brd.style.top = "0px";
                        brd.style.left = "0px";
                        brd.style.position = "unset";
                    }
                    let x = Math.random() * 4, y = Math.random() * 4;
                    if(Math.random() < .5) x = -x;
                    if(Math.random() < .5) y = -y;
                    brd.style.top = y + "px";
                    brd.style.left = x + "px";
                }, 10);
            } else {
                this.openCells(this.mineField[elm.id].x, this.mineField[elm.id].y);
                this.checkEnd();
            }
        }
    }
}
/*
let p = tmp.length, i = tmp.length - 1, t;
while(i > 1) {
    p = Math.floor(Math.random() * i);
    t = tmp[p];
    tmp[p] = tmp[i];
    tmp[i] = t;
    i--;
} 
  */   