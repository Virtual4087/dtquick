if (document.getElementById('datatable')) {
    if (!document.getElementById('datatable').getAttribute('db-table'))
        throw ("Please note you can't continue using without the table name. Use attribute 'db-table' to specify the table name. For more info visit: https://github.com/mohiwalla/dtquick#:~:text=db%2Dtable,from%20the%20database.");
    if (!document.getElementById('datatable').getAttribute('cols'))
        throw ("Please note you can't continue using without specifying the columns. Use attribute 'cols' to specify the columns. For more info visit: https://github.com/mohiwalla/dtquick#:~:text=cols,Email%2C%20Pass%20%3D%20Password%22");
    if (!document.getElementById('datatable').getAttribute('file-name'))
        throw ("Please note you can't continue using without specifying the file-name. Use attribute 'file-name' to specify the file where to AJAX request has to be sent. For more info visit: https://github.com/mohiwalla/dtquick#:~:text=file%2Dname,request%20for%20data.");
    document.head.innerHTML += `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Tilt+Neon&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous"><link href="https://fonts.googleapis.com/css2?family=Montserrat" rel="stylesheet"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><style>*{font-family:"Montserrat",sans-serif}.tcenter{text-align:center}.center{align-items:center;justify-content:center}.flex{display:flex}body{padding:30px;min-height:105vh;overflow-x:hidden;margin-bottom:2vh}thead{user-select:none;}#table,#table th,#table tr,#table td,#table thead,#table tbody{padding:5px 40px;border-collapse:collapse;border:1px solid #000}span{font-size:20px;font-weight:700}th{user-select:none;cursor:pointer;text-align:left}.limitDiv{float:left}.dropdown{font-size:15px;margin-left:10px;font-weight:700;outline:none;padding:5px;border-radius:5px}.searchDiv{float:right}#search{padding:5px;border-radius:5px;border:1px solid #000;outline:none;font-size:15px}.order{width:20px;height:15px;margin-left:10px;top:114px;transition:all .3s}#searchFrom{transform:translate(-10px,0)}#search:focus{border: 1px dashed black;}</style>`;

    document.body.innerHTML += `<div class="limitDiv"><span>Limit</span><select name="limit" class="dropdown" id="limit"><option value="25">25</option><option value="50">50</option><option value="100">100</option><option value="250">250</option><option value="500">500</option></select></div><div class="searchDiv"> <span style="margin-left:10px;">From </span> <select class="dropdown" name="select" oninput="searchFrom = this.value; fetch();" id="searchFrom"><option value="">All</option></select><span>Search </span><input placeholder="Press '/' to focus" type="text" name="search" oninput="key = value; pageNo = 1; fetch();" id="search"></div><br><br><br><div class="flex center"><table style="width:95vw;" id="table"> <thead> <tr id="th"></tr> </thead> <tbody id="tbody"></tbody> </table> </div><br> <h1 class="tcenter" id="notFound" style="display:none; font-weight:700; font-family: 'Tilt Neon', cursive;">No records found ¯\\_(ツ)_/¯<hr></h1> <div id="pages"> <nav> <ul class="pagination justify-content-end"></ul></nav><div style="float:left; margin-top:-45px;" class="info"></div></div>`;

    var cols = document.getElementById("datatable").getAttribute("cols").replace(/ /g, "").split(",");
    var db_table = document.getElementById("datatable").getAttribute("db-table");
    var fileName = document.getElementById("datatable").getAttribute("file-name");

    for (i = 0; i < cols.length; i++) {
        var col = cols[i].split("=");
        document.getElementById("th").innerHTML +=
            `<th onclick="pageNo = 1; checkOrder(this); orderBy = '` +
            col[1] +
            `'; fetch();" class="th asc" >` +
            col[0] +
            `<img style="cursor: pointer; position:absolute; mix-blend-mode: darken;" draggable="false" src='https://raw.githubusercontent.com/mohiwalla/dtquick/c65e03f759b9257ae0d1b4f85fddda002b0d4548/dn2.png' class="order"></th>`;
        var option = document.createElement("option");
        option.value = col[1];
        option.innerHTML = col[0];
        document.getElementById("searchFrom").append(option);
    }

    var pageCount;

    function setPagination() {
        document.getElementsByClassName('pagination')[0].innerHTML = `<li class="page-item"><a class="page-link" tabindex="-1" onclick="setActive(1, true);" >First</a></li>`;

        document.getElementsByClassName('pagination')[0].innerHTML += `<li class="page-item"><a class="page-link" tabindex="-1" onclick="setActive(parseInt(pageNo) - 1, true);" >Previous</a></li>`;

        document.getElementsByClassName('pagination')[0].innerHTML += `<li class="page-item pages"><a onclick="setActive(parseInt(innerHTML), true);" class="page-link">1</a></li>`;

        pageCount = Math.ceil(response["total"] / limit);

        for (i = 2; i <= pageCount; i++)
            document.getElementsByClassName('pagination')[0].innerHTML += `<li class="page-item pages"><a onclick="setActive(parseInt(innerHTML), true);" class="page-link">${i}</a></li>`;

        if (pageCount > 1) {
            document.getElementsByClassName('pagination')[0].innerHTML += `<li class="page-item"><a onclick="setActive(parseInt(pageNo) + 1, true);" class="page-link" tabindex="-1">Next</a></li>`;

            document.getElementsByClassName('pagination')[0].innerHTML += `<li class="page-item"><a onclick="setActive(parseInt(pageCount), true);" class="page-link" tabindex="-1">Last</a></li>`;
        }

        setDisabled();
        setActive(pageNo, false);

        if (pageCount > 7)
            managePagination(pageCount);
    }

    function managePagination(last) {
        if (pageNo < pageCount / 2) {
            for (i = 2; i <= pageNo - 1; i++)
                document.querySelectorAll('.page-item')[i].style.display = 'none';

            for (i = parseInt(pageNo) + 4; i < last; i++) {
                if (document.querySelectorAll('.page-item')[i])
                    document.querySelectorAll('.page-item')[i].style.display = 'none';
            }

            if (pageNo != pageCount)
                if (parseInt(pageNo) + 6 < last - 1) {
                    dots = document.querySelectorAll('.page-link')[pageNo + 3];
                    dots.innerHTML = '...';
                    dots.style.fontWeight = 900;
                    dots.style.cursor = 'auto';
                    dots.style.letterSpacing = '2px';
                }
        }

        else {
            for (i = 6; i <= pageNo - 1; i++)
                document.querySelectorAll('.page-item')[i].style.display = 'none';

            for (i = pageNo + 3; i < last + 2; i++)
                document.querySelectorAll('.page-item')[i].style.display = 'none';

            dots = document.querySelectorAll('.page-link')[5];
            dots.innerHTML = '...';
            dots.style.fontWeight = 900;
            dots.style.cursor = 'auto';
            dots.style.letterSpacing = '2px';
        }
    }

    function setActive(page, byUser) {
        if (isNaN(page))
            return false;
        if (byUser && page == pageNo)
            return false;

        pageItem = document.querySelectorAll('.page-item');

        if (document.querySelector('.page-item.active')) {
            document.querySelector('.page-item.active').classList.remove('active');
        }

        document.querySelectorAll('.pages')[page - 1].classList.add('active');
        pageNo = page;

        if (byUser)
            fetch();
    }


    function setDisabled() {
        if (pageNo == 1) {
            document.getElementsByClassName("page-item")[0].classList.add("disabled");
            document.getElementsByClassName("page-item")[1].classList.add("disabled");

            document.getElementsByClassName("pages")[0].classList.add("active");
        }

        if (pageNo == pageCount)
            if (document.getElementsByClassName("page-item")[parseInt(pageCount) + 2] && document.getElementsByClassName("page-item")[parseInt(pageCount) + 3]) {
                document.getElementsByClassName("page-item")[parseInt(pageCount) + 2].classList.add("disabled");
                document.getElementsByClassName("page-item")[parseInt(pageCount) + 3].classList.add("disabled");
            }
    }

    const id = (str) => document.getElementById(str);
    var notFound = document.getElementById('notFound');
    var orderBy = cols[0].split("=")[1], limit = 25, response, key = '', searchFrom = '', order = "ASC", pageNo = 1, searchQuery;

    id("limit").addEventListener("input", function () {
        limit = this.value;
        pageNo = 1;
        fetch();
    });

    function fetch() {
        const xhr = new XMLHttpRequest();

        xhr.open("GET", `${fileName}?query=${makeQuery()}&totalRecords=${totalRecords()}`, true);
        xhr.onreadystatechange = function () {
            document.body.style.cursor = 'wait';
            if (this.readyState == 4 && this.status == 200) {
                document.body.style.cursor = 'auto';
                response = JSON.parse(this.responseText);
                setInfo();
                setTable();
                setPagination();
            }
        };
        xhr.send();
    }

    function makeQuery() {
        rowsPerPage = pageNo === 1 ? '' : (pageNo - 1) * limit + ', ';

        if (key === '') searchQuery = '';
        else
            if (searchFrom === '') {
                searchQuery = ' and ';
                for (var i = 0; i < cols.length; i++)
                    if (i < cols.length - 1)
                        searchQuery += ` ${cols[i].split("=")[1]} like '%${key}%' or`;
                    else if (i === cols.length - 1)
                        searchQuery += ` ${cols[i].split("=")[1]} like '%${key}%'`;
            }
            else
                searchQuery = ` and ${searchFrom} like '%${key}%'`;

        return encodeURI(`SELECT * from ${db_table} where 1 ${searchQuery} ORDER BY ${orderBy} ${order} limit ${rowsPerPage} ${limit};`);
    }

    function totalRecords() {
        if (key === '') searchQuery = '';
        else
            if (searchFrom === '') {
                searchQuery = ' and ';
                for (var i = 0; i < cols.length; i++)
                    if (i < cols.length - 1)
                        searchQuery += ` ${cols[i].split("=")[1]} like '%${key}%' or`;
                    else if (i === cols.length - 1)
                        searchQuery += ` ${cols[i].split("=")[1]} like '%${key}%'`;
            }
            else
                searchQuery = ` and ${searchFrom} like '%${key}%'`;

        return encodeURI(`SELECT COUNT(*) as totalRecords from ${db_table} where 1 ${searchQuery};`);
    }

    function setInfo() {
        till = response["found"];
        from = parseInt(((pageNo - 1) * limit) + 1);
        to = parseInt(pageNo * limit) - (limit - till);
        document.getElementsByClassName("info")[0].innerHTML =
            "Showing " + till + " (from " + from + ' to ' + to + ") out of " + response["total"];

        if (!till)
            notFound.style.display = 'block';
        else
            notFound.style.display = 'none';
    }

    function setTable() {
        data = response["data"];

        document.getElementById("tbody").innerHTML = "";
        till = response["found"];
        i = 0;
        while (i < till) {
            var tr = document.createElement("tr");
            for (var j = 0; j < cols.length; j++) {
                var td = document.createElement("td");
                td.textContent = data[i][cols[j].split("=")[1]];
                tr.append(td);
            }
            document.getElementById("tbody").append(tr);
            i++;
        }
    }

    function checkOrder(obj) {
        setArrows();
        if (obj.classList.contains("asc")) {
            removeASC();
            obj.classList.remove("asc");
            obj.style.transform = "";
            obj.children[0].style.transform = "rotate(-180deg) scale(1.2)";
            order = "DESC";
        } else {
            removeASC();
            obj.classList.add("asc");
            obj.children[0].style.transform = "scale(1.7)";
            order = "ASC";
        }
    }

    function removeASC() {
        ths = document.getElementsByClassName("th");
        for (i = 0; i < ths.length; i++) ths[i].classList.remove("asc");
    }

    function setArrows() {
        arrows = document.getElementsByClassName("order");
        for (i = 0; i < arrows.length; i++) {
            arrows[i].style.transform = "rotate(0deg) scale(1)";
        }
    }

    this.onkeyup = (e) => {
        if (e.key === '/')
            search.focus();
    }

    document.addEventListener("load", fetch());
}
