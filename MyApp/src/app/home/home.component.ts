
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IAuthSession } from '@servicestack/client';
import { StoreService } from '../shared/store';


export var PieceColor = ['#FFFFFF', 'blue', 'red', 'green']
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
    private height = 20;
    private width = 10;

    private input = `Q0
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
    `

    private tetrixBlocks = {
        Q: [[1, 1], [1, 1]],
        Z: [[1, 1, 0], [0, 1, 1]],
        S: [[0, 1, 1], [1, 1, 0]],
        T: [[1, 1, 1], [0, 1, 0]],
        I: [[1, 1, 1, 1]],
        L: [[1, 0], [1, 0], [1, 1]],
        J: [[0, 1], [0, 1], [1, 1]]
    }

    constructor() {
        //initialize 2D array (matrix) for the tetrix board        
        this.resetBoard()

        this.showResult("I0,I4,Q8");
    }


    ngOnInit() {

    }

    showResult(definition: string) {
        var operations = definition.split(',');
        
        this.findOptimalRowHeight(operations);

        this.resetBoard();

        

        for (let opNum = 0; opNum < operations.length; opNum++) {
            //get the piece configuration
            var piece = this.tetrixBlocks[operations[opNum][0]];
            var colStart = parseInt(operations[opNum][1]);

            var pieceLanded = false;
            
            for (let row = 0; row < this.visibleGrid.length - piece.length; row++) {
                for (let y = 0; y < piece.length; y++) //go through the piece width
                {
                    for (let x = 0; x < piece[0].length; x++) //go through the piece height
                    {
                        if (row > 0) {
                            this.drawPiece(piece, row - 1, colStart, opNum, false);
                        }

                        if (this.visibleGrid[row + y][colStart + x].filled) {
                            //put the piece 1 position above where it isn't working
                            this.drawPiece(piece, row - 1, colStart, opNum, true);

                            pieceLanded = true;
                            break;
                        }
                        
                    }

                    if (pieceLanded) {
                        break;
                    }
                }
            }
            if (!pieceLanded) {
                //it should land at the most bottom row
                this.drawPiece(piece, this.visibleGrid.length - piece.length, colStart, opNum, true);
            }
        }
    }

    findOptimalRowHeight(operations: string[]) {
        this.height = 3; //start with buffer of 3 on the top

        for (let i = 0; i < operations.length; i++) {            
            let piece: [][] = this.tetrixBlocks[operations[i][0]];
            this.height += piece.length;  
        }

        console.log('new height', this.height)
    }

    drawPiece(piece: [][], row: number, colStart: number, opNum, filled) {
        console.log('drawPiece start');
        
        console.log(row, colStart, opNum)
        for (let y = 0; y < piece.length; y++) { //row
            for (let x = 0; x < piece[0].length; x++) { //column
                if (piece[y][x] === 1) {
                    this.visibleGrid[row + y][colStart + x] = { filled: filled, color: PieceColor[opNum + 1] }
                }
        
            
            }
        }

        //Check if line is complete to remove it (and add a new row to top)
        var eraseCount = 0;
        for (let r = row + piece.length - 1; r >= row; r--) {
            let erase = true;
            for (let c = 0; c < this.width; c++) {
                if (!this.visibleGrid[r][c].filled) {
                    erase = false;
                }
            }
            if (erase) {
                this.visibleGrid.splice(r, 1);
                eraseCount++;
            }
        }
        //re-add the rows you erased to the top
        for (let a = 0; a < eraseCount; a++) {
            this.visibleGrid.unshift(new Array());
            for (let j = 0; j < this.width; j++) {
                this.visibleGrid[0][j] = { filled: false, color: PieceColor[0] };
            }
        }


        console.log('drawPiece end');

    }

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
                this.visibleGrid[i][j] = { filled: false, color: PieceColor[0] };
            }
        }
        console.log('resetBoard finished');


    }

}
