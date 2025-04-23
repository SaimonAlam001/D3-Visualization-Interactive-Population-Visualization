d3.csv("data/countries_population.csv").then(function (data) {
    data.forEach(d => {
      d.Country = d.Country.trim();
      d.Year = +d.Year;
      d.Population = +d.Population;
    });
  
    const years = [...new Set(data.map(d => d.Year))].sort();
  
    const verifiedEntities = [
        'Arab World', 'Caribbean small states', 'Central African Republic', 
        'Central Europe and the Baltics', 'Early-demographic dividend', 'East Asia & Pacific',
        'East Asia & Pacific (IDA & IBRD countries)', 'East Asia & Pacific (excluding high income)',
        'Euro area', 'Europe & Central Asia',
        'Europe & Central Asia (IDA & IBRD countries)', 'Europe & Central Asia (excluding high income)',
        'European Union', 'Fragile and conflict affected situations',
        'Heavily indebted poor countries (HIPC)', 'High income', 'IBRD only',
        'IDA & IBRD total', 'IDA blend', 'IDA only', 'IDA total',
        'Late-demographic dividend', 'Latin America & Caribbean',
        'Latin America & Caribbean (excluding high income)',
        'Latin America & the Caribbean (IDA & IBRD countries)',
        'Least developed countries: UN classification', 'Low & middle income', 'Low income',
        'Lower middle income', 'Middle East & North Africa',
        'Middle East & North Africa (IDA & IBRD countries)',
        'Middle East & North Africa (excluding high income)', 'Middle income',
        'North America', 'OECD members', 'Pacific island small states',
        'Post-demographic dividend', 'Pre-demographic dividend',
        'South Asia', 'South Asia (IDA & IBRD)', 'Sub-Saharan Africa',
        'Sub-Saharan Africa (IDA & IBRD countries)', 'Sub-Saharan Africa (excluding high income)',
        'Upper middle income', 'World'
      ];
  
    const allNames = [...new Set(data.map(d => d.Country))];
    const countriesOnly = allNames.filter(name => !verifiedEntities.includes(name));
    const countries = ["World", ...countriesOnly.sort()];
    const entities = ["World", ...verifiedEntities.sort()];
  
    // Populate dropdowns
    years.forEach(year => {
      d3.select("#yearCountries").append("option").text(year).attr("value", year);
      d3.select("#yearEntities").append("option").text(year).attr("value", year);
    });
  
    countries.forEach(c => {
      d3.select("#countryDropdown").append("option").text(c).attr("value", c);
    });
  
    entities.forEach(e => {
      d3.select("#entityDropdown").append("option").text(e).attr("value", e);
    });
  
    const latestYear = d3.max(years);
    d3.select("#yearCountries").property("value", latestYear);
    d3.select("#yearEntities").property("value", latestYear);
  
    updateCountryChart(latestYear, "World");
    updateEntityChart(latestYear, "World");
  
    d3.select("#yearCountries").on("change", () => {
      updateCountryChart(+d3.select("#yearCountries").property("value"), d3.select("#countryDropdown").property("value"));
    });
    d3.select("#countryDropdown").on("change", () => {
      updateCountryChart(+d3.select("#yearCountries").property("value"), d3.select("#countryDropdown").property("value"));
    });
  
    d3.select("#yearEntities").on("change", () => {
      updateEntityChart(+d3.select("#yearEntities").property("value"), d3.select("#entityDropdown").property("value"));
    });
    d3.select("#entityDropdown").on("change", () => {
      updateEntityChart(+d3.select("#yearEntities").property("value"), d3.select("#entityDropdown").property("value"));
    });
  
    function updateCountryChart(year, country) {
      d3.select("#countryChart")?.remove();
  
      const svg = d3.select("#countriesSection").append("svg")
        .attr("id", "countryChart")
        .attr("width", 800)
        .attr("height", 450);
  
      const margin = { top: 50, right: 30, bottom: 100, left: 100 };
      const width = 800, height = 450;
  
      if (country === "World") {
        const filtered = data.filter(d => d.Year === year && !verifiedEntities.includes(d.Country))
          .sort((a, b) => b.Population - a.Population)
          .slice(0, 10);
  
        const x = d3.scaleBand().domain(filtered.map(d => d.Country)).range([margin.left, width - margin.right]).padding(0.2);
        const y = d3.scaleLinear().domain([0, d3.max(filtered, d => d.Population)]).nice().range([height - margin.bottom, margin.top]);
  
        svg.selectAll(".bar")
          .data(filtered)
          .enter()
          .append("rect")
          .attr("x", d => x(d.Country))
          .attr("y", d => y(d.Population))
          .attr("width", x.bandwidth())
          .attr("height", d => height - margin.bottom - y(d.Population))
          .attr("fill", "steelblue")
          .append("title").text(d => `${d.Country}: ${d.Population.toLocaleString()}`);
  
        svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`)
          .call(d3.axisBottom(x))
          .selectAll("text").attr("transform", "rotate(-45)").style("text-anchor", "end");
  
        svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y));
        svg.append("text").attr("x", width / 2).attr("y", margin.top - 30).attr("text-anchor", "middle")
          .style("font-size", "18px").text(`Top 10 Most Populated Countries (${year})`);
      } else {
        const trend = data.filter(d => d.Country === country);
        const x = d3.scaleLinear().domain(d3.extent(trend, d => d.Year)).range([margin.left, width - margin.right]);
        const y = d3.scaleLinear().domain([0, d3.max(trend, d => d.Population)]).nice().range([height - margin.bottom, margin.top]);
        const line = d3.line().x(d => x(d.Year)).y(d => y(d.Population));
  
        svg.append("path").datum(trend).attr("fill", "none").attr("stroke", "steelblue").attr("stroke-width", 2).attr("d", line);
        svg.selectAll("circle").data(trend).enter().append("circle")
          .attr("cx", d => x(d.Year)).attr("cy", d => y(d.Population)).attr("r", 3).attr("fill", "orange")
          .append("title").text(d => `${d.Year}: ${d.Population.toLocaleString()}`);
  
        svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));
        svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y));
        svg.append("text").attr("x", width / 2).attr("y", margin.top - 30).attr("text-anchor", "middle")
          .style("font-size", "18px").text(`Population of ${country} Over Time`);
      }
    }
  
    function updateEntityChart(year, entity) {
      d3.select("#entityChart")?.remove();
  
      const svg = d3.select("#entitiesSection").append("svg")
        .attr("id", "entityChart")
        .attr("width", 800)
        .attr("height", 450);
  
      const margin = { top: 50, right: 30, bottom: 100, left: 100 };
      const width = 800, height = 450;
  
      if (entity === "World") {
        const filtered = data.filter(d => d.Year === year && verifiedEntities.includes(d.Country))
          .sort((a, b) => b.Population - a.Population)
          .slice(0, 10);
  
        const x = d3.scaleBand().domain(filtered.map(d => d.Country)).range([margin.left, width - margin.right]).padding(0.2);
        const y = d3.scaleLinear().domain([0, d3.max(filtered, d => d.Population)]).nice().range([height - margin.bottom, margin.top]);
  
        svg.selectAll(".bar")
          .data(filtered)
          .enter()
          .append("rect")
          .attr("x", d => x(d.Country))
          .attr("y", d => y(d.Population))
          .attr("width", x.bandwidth())
          .attr("height", d => height - margin.bottom - y(d.Population))
          .attr("fill", "teal")
          .append("title").text(d => `${d.Country}: ${d.Population.toLocaleString()}`);
  
        svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`)
          .call(d3.axisBottom(x)).selectAll("text").attr("transform", "rotate(-45)").style("text-anchor", "end");
        svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y));
        svg.append("text").attr("x", width / 2).attr("y", margin.top - 30).attr("text-anchor", "middle")
          .style("font-size", "18px").text(`Top 10 Most Populated Entities (${year})`);
      } else {
        const trend = data.filter(d => d.Country === entity);
        const x = d3.scaleLinear().domain(d3.extent(trend, d => d.Year)).range([margin.left, width - margin.right]);
        const y = d3.scaleLinear().domain([0, d3.max(trend, d => d.Population)]).nice().range([height - margin.bottom, margin.top]);
        const line = d3.line().x(d => x(d.Year)).y(d => y(d.Population));
  
        svg.append("path").datum(trend).attr("fill", "none").attr("stroke", "teal").attr("stroke-width", 2).attr("d", line);
        svg.selectAll("circle").data(trend).enter().append("circle")
          .attr("cx", d => x(d.Year)).attr("cy", d => y(d.Population)).attr("r", 3).attr("fill", "orange")
          .append("title").text(d => `${d.Year}: ${d.Population.toLocaleString()}`);
  
        svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));
        svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y));
        svg.append("text").attr("x", width / 2).attr("y", margin.top - 30).attr("text-anchor", "middle")
          .style("font-size", "18px").text(`Population of ${entity} Over Time`);
      }
    }
  });
  