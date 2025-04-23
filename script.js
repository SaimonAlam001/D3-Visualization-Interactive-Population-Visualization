d3.csv("data/countries_population.csv").then(function(data) {
    data.forEach(d => {
        d.Country = d.Country.trim();
        d.Year = +d.Year;
        d.Population = +d.Population;
    });

    const years = [...new Set(data.map(d => d.Year))].sort();
    const countries = ["World", ...new Set(data.map(d => d.Country).sort())];

    const controls = d3.select("body").insert("div", "svg").attr("id", "controls");

    controls.append("label").text("Select Year: ");
    const yearDropdown = controls.append("select").attr("id", "yearDropdown");
    yearDropdown.selectAll("option")
        .data(years)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    controls.append("label").text(" Select Country: ");
    const countryDropdown = controls.append("select").attr("id", "countryDropdown");
    countryDropdown.selectAll("option")
        .data(countries)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    updateChart(d3.max(years), "World");

    yearDropdown.on("change", () => {
        updateChart(+yearDropdown.property("value"), countryDropdown.property("value"));
    });

    countryDropdown.on("change", () => {
        updateChart(+yearDropdown.property("value"), countryDropdown.property("value"));
    });

    function updateChart(year, country) {
        d3.select("svg").remove(); 

        const width = 800;
        const height = 500;
        const margin = { top: 50, right: 30, bottom: 100, left: 100 };

        const svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        if (country === "World") {
            const filtered = data.filter(d => d.Year === year)
                .sort((a, b) => b.Population - a.Population)
                .slice(0, 10);

            const x = d3.scaleBand()
                .domain(filtered.map(d => d.Country))
                .range([margin.left, width - margin.right])
                .padding(0.2);

            const y = d3.scaleLinear()
                .domain([0, d3.max(filtered, d => d.Population)])
                .nice()
                .range([height - margin.bottom, margin.top]);

            svg.selectAll(".bar")
                .data(filtered)
                .enter()
                .append("rect")
                .attr("x", d => x(d.Country))
                .attr("y", d => y(d.Population))
                .attr("width", x.bandwidth())
                .attr("height", d => height - margin.bottom - y(d.Population))
                .attr("fill", "steelblue")
                .append("title")
                .text(d => `${d.Country}: ${d.Population.toLocaleString()}`);

            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end");

            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y));

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", margin.top - 20)
                .attr("text-anchor", "middle")
                .style("font-size", "20px")
                .text(`Top 10 Population Totals (${year})`);
        } else {
            const countryData = data.filter(d => d.Country === country);

            const x = d3.scaleLinear()
                .domain(d3.extent(countryData, d => d.Year))
                .range([margin.left, width - margin.right]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(countryData, d => d.Population)])
                .nice()
                .range([height - margin.bottom, margin.top]);

            const line = d3.line()
                .x(d => x(d.Year))
                .y(d => y(d.Population));

            svg.append("path")
                .datum(countryData)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 2)
                .attr("d", line);

            svg.selectAll("circle")
                .data(countryData)
                .enter()
                .append("circle")
                .attr("cx", d => x(d.Year))
                .attr("cy", d => y(d.Population))
                .attr("r", 3)
                .attr("fill", "darkorange")
                .append("title")
                .text(d => `${d.Year}: ${d.Population.toLocaleString()}`);

            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x).tickFormat(d3.format("d")));

            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y));

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", margin.top - 20)
                .attr("text-anchor", "middle")
                .style("font-size", "20px")
                .text(`Population of ${country} Over Time`);
        }
    }
});
