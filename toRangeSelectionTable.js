var toRangeSelectionTable = function (tableNode) {

	tableNode.classList.add("range-selection");

	var startCell = null;
	[].forEach.call(tableNode.querySelectorAll("td"), function (td) {
		var selectAreaOfCell = function (start, end) {

			// get cell index
			var tmpNode;

			var sx = 0;
			tmpNode = start;
			while ((tmpNode = tmpNode.previousElementSibling) != null ) sx++;
			var sy = 0;
			tmpNode = start.parentElement;
			while ((tmpNode = tmpNode.previousElementSibling) != null ) sy++;

			var ex = 0;
			tmpNode = end;
			while ((tmpNode = tmpNode.previousElementSibling) != null ) ex++;
			var ey = 0;
			tmpNode = end.parentElement;
			while ((tmpNode = tmpNode.previousElementSibling) != null ) ey++;

			// swap to get the top-left index
			var swapTmp;
			if (sx > ex) {
				swapTmp = ex;
				ex = sx;
				sx = swapTmp;
			}
			if (sy > ey) {
				swapTmp = ey;
				ey = sy;
				sy = swapTmp;
			}
			// console.log(sx, sy, ex, ey);

			// area selection
			var table = start.parentElement.parentElement;
			[].slice.call(table.children, sy, ey + 1).forEach(function (tr) {
				[].slice.call(tr.children, sx, ex + 1).forEach(function (cell) {
					cell.classList.add("area-selected");
				});
				tr.classList.add("area-selected");
			});
		};

		td.addEventListener("mousedown", function(e) {

			// clear all area selection
			[].slice.call(tableNode.querySelectorAll(".selected")).forEach(function (sNode) {
				sNode.classList.remove("selected");
			});
			// clear all area selection
			[].slice.call(tableNode.querySelectorAll(".area-selected")).forEach(function (asNode) {
				asNode.classList.remove("area-selected");
			});

			// select current cell
			startCell = e.target;
			startCell.classList.add("selected");

			// let table get selected for the copy event
			var range = document.createRange();
			range.selectNode(startCell);
			var selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(range);
		});
		td.addEventListener("mouseup", function(e) {
			startCell = null;
		});

		td.addEventListener("mouseenter", function(e) {
			if (startCell) {
				// clear all area selection
				[].slice.call(tableNode.querySelectorAll(".area-selected")).forEach(function (asNode) {
					asNode.classList.remove("area-selected");
				});

				selectAreaOfCell(startCell, e.target);
			}
		});
	});

	// table event
	tableNode.addEventListener("mouseleave", function(e) {
		// mouse out of table
		startCell = null;
	});
	tableNode.addEventListener("copy", function(e) {

		var table = e.target;
		while ((table.tagName !== "TABLE" && table.tagName !== "TBODY") && table.parentElement != null) table = table.parentElement;
		if (!table) return;

		var trs = table.querySelectorAll("tr.area-selected");
		if (trs.length === 0) {
			// console.log("no area selection");
			var currentSelection = table.querySelector("td.selected");
			// console.log(table, table.querySelector("td.selected"));
			if (currentSelection) e.clipboardData.setData('text/plain', currentSelection.textContent);
		} else {
			var copyStrings = [];
			[].forEach.call(trs, function (tr) {
				var tds = tr.querySelectorAll(".area-selected");
				copyStrings.push([].map.call(tds, td => td.textContent ).join("\t"));
			});
			e.clipboardData.setData('text/plain', copyStrings.join("\n"));
		}
		e.preventDefault();
	});
};
