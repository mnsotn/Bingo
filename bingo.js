// Copyright 2020 Chris Bovitz mnsotn@yahoo.com

var header = new Array ('B', 'I', 'N', 'G', 'O');
var gridRows = header.length;
var gridCols = 15;
var numBalls = gridRows * gridCols;
var cardRows = 5;
var cardCols = gridRows;
var blackout = false;
var lastClickedRow;
var lastClickedCol;
var freeSpaceText = "free";

function OnClick (table)
{
    for (var row = 1; row < cardRows+1; row++)
    {
        for (var col = 0; col < cardCols; col++)
        {
            var cell = table.rows[row].cells[col];
            cell.onclick =
            function (c)
            {
                var rowIndex = c.target.parentElement.rowIndex;
                var colIndex = c.target.cellIndex;
                if (! isFreeSpace (this))
                {
                    CoverAction (this, rowIndex, colIndex);
                    if (c.target.classList.contains("cover"))
                        CheckForBingo(table, rowIndex-1, colIndex);
                }
                lastClickedRow = rowIndex-1;
                lastClickedCol = colIndex;
            };
            cell.oncontextmenu =
            function (c)
            {
                var rowIndex = c.target.parentElement.rowIndex;
                var colIndex = c.target.cellIndex;
                if (! isFreeSpace (this))
                {
                    CoverAction (this, rowIndex, colIndex);
                    if (c.target.classList.contains("cover"))
                        CheckForBingo(table, rowIndex-1, colIndex);
                }
                lastClickedRow = rowIndex-1;
                lastClickedCol = colIndex;
            };
        }
    }
}

function isFreeSpace (cell)
{
	return (cell.innerHTML == freeSpaceText);
}

function CoverAction (cell, row, col)
{
    if (cell.innerHTML != freeSpaceText)
    {
        if (cell.classList.contains("cover"))
            cell.classList.remove("cover");
        else
            cell.classList.add("cover");
    }
}

function CreateGrid (tableId)
{
    // Create the grid
    grid = document.getElementById(tableId);

    for (var r = 0; r < gridRows; r++)
    {
        var newRow = grid.insertRow(r);
        var newCell;
        // header

        newCell = newRow.insertCell();
        newCell.outerHTML = "<th id=\"head"+(r+1)+"\" class=\"bingo\">" + header[r] + "<\/th>";
        newCell.classList.add(header[r]);
        
        for (var c = 0; c < gridCols; c++)  // -1 for the header row
        {
            newCell = newRow.insertCell();
            var ballNumber =  r * gridCols + c + 1;
            newCell.innerHTML = ballNumber;
            newCell.classList.add(header[r], BallClass(ballNumber));
        }
    }
}

function CreateCard (tableId)
{
    var c;
    var r;

    // Create a card
    card = document.getElementById(tableId);

    var x = new Array(cardRows);
    for (c = 0; c < cardCols; c++)
        x[c] = new Array(cardRows);

    // fill array with valid bingo card numbers (no duplicates)
    for (c = 0; c < cardCols; c++)
    {
        var str = "|";
        for (r = 0; r < cardRows; r++)
        {
            var value = (Math.floor(Math.random() * gridCols) + 1) + (c * gridCols);
            while (str.indexOf("|"+value+"|") >= 0)
                value = (Math.floor(Math.random() * gridCols) + 1) + (c * gridCols);
            str += value + "|";
            x[c][r] = value;
        }
    }

    // header
    var newRow = card.insertRow(0);
    for (c = 0; c < cardCols; c++)
    {
        newCell = newRow.insertCell();
        newCell.outerHTML = "<th id=\"head"+(c+1)+"\"class=\"bingo\">" + header[c] + "<\/th>";
        newCell.classList.add(header[c]);
    }

    for (r = 0; r < cardRows; r++)
    {
        var newRow = card.insertRow();
        for (var c = 0; c < cardCols; c++)
        {

            newCell = newRow.insertCell();
            newCell.id = Index(r+1,c+1);
            newCell.innerHTML = x[c][r  ];
            newCell.classList.add(header[c]);
            if ((c == Math.floor(cardCols/2)) &&
                (r == Math.floor(cardRows/2)))
            {
                newCell.innerHTML = freeSpaceText;
                newCell.classList.add("freeSpace");
                newCell.classList.add("cover");
            }
        }
    }

}

function BallClass (n)
{
    return "ball-" + n;
}

function Index (r,c)
{
    var index = "r" + r + "c" + c;
    return index;
}

function PickBall (table)
{
    var coveredBalls = document.getElementsByClassName("cover");
    if (coveredBalls.length == numBalls)
    {
        alert ("No more balls!");
        return;
    }

    var ballNumber = Math.floor (Math.random() * (numBalls)) + 1;
    var covered = document.getElementsByClassName(BallClass(ballNumber));
    if (covered.length != 1)
    {
        alert("Try again");
        return;
    }

    while (covered[0].classList.contains("cover"))
    {
        ballNumber = Math.floor (Math.random() * (numBalls)) + 1;
        covered = document.getElementsByClassName(BallClass(ballNumber));
        if (covered.length != 1)
        {
            alert("Try again");
            return;
        }
    }

    var row = header[Math.floor ((ballNumber - 1) / gridCols)];
    alert(row+" "+ballNumber);
    covered[0].classList.add("cover");
}

function ClearGrid (table)
{
    if (confirm ("Are you sure you want to clear the board?"))
        ClearIt (table);
}

function ClearCard (table)
{
    if (confirm ("Are you sure you want to clear the card?"))
        ClearIt (table);
}

function ClearIt (table)
{
    var covered = document.getElementsByClassName("cover");
    for (var i = covered.length-1; i >= 0; i--)
        covered[i].classList.remove("cover");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function CheckForBingo (table, r0, c0)
{
    // r1 and c1 are one-based
    var count;
    var r;
    var c;
    var c1 = c0+1;
    var r1 = r0+1;
    var bingo = false;

	await sleep(200); // give time for cell to change colors

    // Blackout/coverall
    if (blackout)
    {
		sleep(200);
        if (document.getElementsByClassName("cover").length == (cardRows * cardCols))
        {
            alert ("YOU'VE GOT A BLACKOUT!")
            return true;
        }
    }
    else
    {
        // Corner bingo?

        if (! bingo &&
            ((r1 == 1) || (r1 == cardRows)) &&
            ((c1 == 1) || (c1 == cardRows)))
        {
            count = 1;  // Free space
            for (r = 1; r <= cardRows; r += (cardRows-1))
            {
                for (c = 1; c <= cardCols; c += (cardCols-1))
                {
                    if (document.getElementById(Index(r,c)).classList.contains("cover"))
                        count++;
                }
            }
            if (count == 5)
                bingo = true;
        }

        // Diagonal bingo?

        if (! bingo &&
            ((r1 == c1) ||
             (r1 == ((cardCols + 1) - c1))))
        {
            count = 0;
            for (r = 1; r <= cardRows; r++)
            {
                if (r1 == c1)
                    c = r
                else
                    c = ((cardRows + 1) - r)
                if ((document.getElementById(Index(r,c)).classList.contains("cover")) ||
                    (document.getElementById(Index(r,c)).innerHTML == freeSpaceText))
                    count++;
            }
            if (count == 5)
                bingo = true;
        }

        // Row bingo?

        if (! bingo)
        {
            count = 0;
            // Check row
            for (c = 1; c <= cardCols; c++)
            {
                if ((document.getElementById(Index(r1,c)).classList.contains("cover")) ||
                    (document.getElementById(Index(r1,c)).innerHTML == freeSpaceText))
                    count++;
            }
            if (count == cardCols)
                bingo = true;
        }

        // Column bingo?

        if (! bingo)
        {
            count = 0;
            // Check column
            for (r = 1; r <= cardRows; r++)
            {
                if ((document.getElementById(Index(r,c1)).classList.contains("cover")) ||
                    (document.getElementById(Index(r,c1)).innerHTML == freeSpaceText))
                    count++;
            }
            if (count == cardCols)
                bingo = true;
        }
        if (bingo)
        {
            alert ("YOU'VE GOT A BINGO!")
            return true;
        }
    }

    return false;
}

function GameType ()
{
    var h;

    if (document.getElementsByClassName("cover").length > 1)  // free space is always covered
    {
        if (! confirm("You've already started a game.\nAre you sure you want to change?"))
            return;
        ClearCard ();
    }

    if (blackout)
    {
        blackout = false;
        // Switch to bingo
        document.getElementById("gameType").classList.remove("bingo");
        document.getElementById("gameType").classList.add("blackout");
        document.getElementById("gameType").textContent = "Play Blackout";
        document.getElementById("gameType").innerHTML = "Play Blackout";
        for (h = 1; h <= header.length; h++)
        {
            document.getElementById("head"+h).classList.remove("blackout");
            document.getElementById("head"+h).classList.add("bingo");
        }
        CheckForBingo ("card", lastClickedRow, lastClickedCol);
    }
    else
    {
        blackout = true;
        // Switch to blackout
        document.getElementById("gameType").classList.remove("blackout");
        document.getElementById("gameType").classList.add("bingo");
        document.getElementById("gameType").textContent = "Play Bingo";
        document.getElementById("gameType").innerHTML = "Play Bingo";
        for (h = 1; h <= header.length; h++)
        {
            document.getElementById("head"+h).classList.remove("bingo");
            document.getElementById("head"+h).classList.add("blackout");
        }
    }

}
