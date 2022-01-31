
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IAuthSession } from '@servicestack/client';
import { StoreService } from '../shared/store';


export var PieceColor = ['#C0392B', '#2980B9', '#FF007F', '#F1C40F', '#8E44AD', '#34495E', '#E74C3C', '#7F8C8D', '#BB8FCE', '#A04000', '#ABEBC6', '#F1948A', '#0E6655' ]
export class ColData {
    public filled: boolean = false;
    public color: string = PieceColor[0];
}



@Component({
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnInit {

    public visibleGrid: ColData[][] = [];
    public height = 20; //height of the tetris board
    private width = 10; //width of the tetris board

    public maxBlockHeight = 0;  //as the blocks come down, it calculates what the height of all the pieces together are

    public showInput = false;   //show the input dialog

    public input = (`Q0
    Q0,Q1
    Q0,Q2,Q4,Q6,Q8
    Q0,Q2,Q4,Q6,Q8,Q1
    Q0,Q2,Q4,Q6,Q8,Q1,Q1
    I0,I4,Q8
    I0,I4,Q8,I0,I4
    L0,J2,L4,J6,Q8
    L0,Z1,Z3,Z5,Z7
    T0,T3
    T0,T3,I6,I6
    I0,I6,S4
    T1,Z3,I4
    L0,J3,L5,J8,T1
    L0,J3,L5,J8,T1,T6
    L0,J3,L5,J8,T1,T6,J2,L6,T0,T7
    L0,J3,L5,J8,T1,T6,J2,L6,T0,T7,Q4
    S0,S2,S4,S6
    S0,S2,S4,S5,Q8,Q8,Q8,Q8,T1,Q1,I0,Q4
    L0,J3,L5,J8,T1,T6,S2,Z5,T0,T7
    Q0,I2,I6,I0,I6,I6,Q2,Q4 
    `).split('\n').map(x => x.trim());      //initial input (user can change this through a textarea)

    public getInput = '';                   //textarea binding

    public currentResult = -1;              //which result is currently clicked on by the user and animated (so we can highlight it's number)

    private tetrisBlocks = {                //definition of the tetris blocks (L shape, Z shape, Square, Line)
        Q: [[1, 1], [1, 1]],
        Z: [[1, 1, 0], [0, 1, 1]],
        S: [[0, 1, 1], [1, 1, 0]],
        T: [[1, 1, 1], [0, 1, 0]],
        I: [[1, 1, 1, 1]],
        L: [[1, 0], [1, 0], [1, 1]],
        J: [[0, 1], [0, 1], [1, 1]]
    }


    showingResult: boolean = false; //if true, it disables the interface so they can't click on multiple things at once;

    constructor(private ref: ChangeDetectorRef) {
        //initialize 2D array (matrix) for the tetrix board        
        this.resetBoard();

    }


    async ngOnInit() {
        //await this.showResult("S0,S2,S4,S5,Q8,Q8,Q8,Q8,T1,Q1,I0,Q4");
    }

    async showResult(definition: string) {
        this.showingResult = true;
        
        definition = definition.trim();
        //remove any trailing comma
        while (definition.endsWith(',')) {
            definition = definition.substring(0, definition.length - 1);
        }

        //split it so we can iterate through the puzzle pieces as they come down
        var operations = definition.split(',');

        this.findOptimalRowHeight(operations);

        this.resetBoard();



        for (let opNum = 0; opNum < operations.length; opNum++) {
            //get the piece configuration
            var piece = this.tetrisBlocks[operations[opNum][0]];
            var colStart = parseInt(operations[opNum][1]);

            var rowLanded = 0;

            for (let row = 0; row <= this.visibleGrid.length - piece.length; row++) {
                let canGoDown = true;
                //erase previous row when drawing
                //we must do this before we keep going
                if (row > 0) {
                    await this.drawPiece(piece, row - 1, colStart, opNum, false);
                }

                for (let y = 0; y < piece.length; y++) //go through the piece height
                {
                    for (let x = 0; x < piece[0].length; x++) //go through the piece width
                    {
                        if (piece[y][x] == 1 && this.visibleGrid[row + y][colStart + x].filled) {
                            canGoDown = false; 
                            break;
                        }
                    }
                    if (!canGoDown) {
                        break;
                    }
                }

                if (canGoDown) {                   
                    await this.drawPiece(piece, row, colStart, opNum, true);
                    rowLanded = row;
                }
                else {
                    await this.drawPiece(piece, row - 1, colStart, opNum, true);
                    rowLanded = row - 1;
                    break;
                }

            }

            this.maxBlockHeight = Math.max(this.height - rowLanded, this.maxBlockHeight);
            await this.checkRowComplete(piece, rowLanded);

        }

        this.showingResult = false;
        this.currentResult = -1;
    }

    findOptimalRowHeight(operations: string[]) {
        this.height = 3; //start with buffer of 3 on the top

        for (let i = 0; i < operations.length; i++) {
            let piece: [][] = this.tetrisBlocks[operations[i][0]];
            this.height += piece.length;
        }

        this.height = Math.min(100, this.height);

        console.log('new height', this.height)
    }

    async drawPiece(piece: [][], row: number, colStart: number, opNum, filled) {

        //console.log(row, colStart, opNum)
        for (let y = 0; y < piece.length; y++) { //row
            for (let x = 0; x < piece[0].length; x++) { //column
                if (piece[y][x] === 1) {
                    this.visibleGrid[row + y][colStart + x] = { filled: filled, color: PieceColor[(opNum) % (PieceColor.length - 1)] }
                }
            }
        }



        if (filled) {
            this.ref.markForCheck();
            await this.sleep(this.height < 50 ? 40 : 15);
        }


    }

    private sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

    async checkRowComplete(piece, row) {
        //Check if line is complete to remove it (and add a new row to top)

        //stop angular from refreshing the view
        this.ref.detach();
        var eraseCount = 0;

        for (let r = row + piece.length - 1; r >= row; r--) {
            let erase = true;
            //check if all the columns in this row are full
            for (let c = 0; c < this.width; c++) {
                if (!this.visibleGrid[r][c].filled) {
                    erase = false;
                }
            }


            if (erase) {
                //Make it red first
                for (let c = 0; c < this.width; c++) {
                    this.visibleGrid[r][c].color = '#E74C3C';
                }
                this.ref.detectChanges();
                await this.sleep(500);

                //remove the row that is full
                this.visibleGrid.splice(r, 1);
                //add a new row to the top of the matrix so we keep the height of the matrix consistent
                this.visibleGrid.unshift(new Array());
                //initialize the columns of the new row we added to the matrix
                for (let j = 0; j < this.width; j++) {
                    this.visibleGrid[0][j] = { filled: false, color: '#FFF' };
                }
                eraseCount++;
                r++; //go back a row to check (when we deleted this row, it needs to check if the row after it which is now a number less has also been completed)
            }
        }

        this.maxBlockHeight -= eraseCount;

        //allow angular to check states again
        this.ref.reattach();

    }

    //Resets the board with the new height (and if new row need to be added, then add them and initialize them)
    resetBoard() {
        console.log('resetBoard start');
        if (this.visibleGrid.length > this.height) {
            //erase extra rows for the next set to show
            this.visibleGrid.splice(0, this.visibleGrid.length - this.height);
        }

        for (let i = 0; i < this.height; i++) {
            if (!this.visibleGrid[i])
                this.visibleGrid.push(new Array());

            for (let j = 0; j < this.width; j++) {
                this.visibleGrid[i][j] = { filled: false, color: '#FFF' };
            }
        }
        console.log('resetBoard finished');

        this.maxBlockHeight = 0;


    }

    showInputWindow() {
        this.getInput = this.input.join('\n');
        this.showInput = true;
    }

    submitInput() {
        this.input = this.getInput.split('\n').map(x => x.trim().trim());
        this.showInput = false;
    }

}
