enum era_t
{
	EE,
	AME,
	PME,
	NME
};

const era_names: string[] =
[
	"Early Era",
	"Ante Modern Era",
	"Previous Modern Era",
	"New Modern Era"
];

const era_abbreviations: string[] =
[
	"EE",
	"AME",
	"PME",
	"NME"
];

function era_to_string(era: era_t, abbr: boolean): string
{
	if (!abbr)
	{
		return era_names[era];
	}
	else
	{
		return era_abbreviations[era];
	}
}

enum month_t
{
	March,
	April,
	May,
	June,
	July,
	August,
	September,
	October,
	November,
	December
};

const month_names: string[] =
[
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];

function month_to_string(month: month_t): string
{
	return month_names[month];
}

enum decade_day_t
{
	Primidy,
	Duody,
	Tridy,
	Quartidy,
	Quintidy,
	Sextidy,
	Septidy,
	Octidy,
	Nonidy,
	Decady,
};

const decade_day_names: string[] =
[
	"Primidy",
	"Duody",
	"Tridy",
	"Quartidy",
	"Quintidy",
	"Sextidy",
	"Septidy",
	"Octidy",
	"Nonidy",
	"Decady"
];

function day_to_string(day: decade_day_t): string
{
	return decade_day_names[day];
}

const DAYS_IN_SHORT_MONTH = 36;
const DAYS_IN_LONG_MONTH = 37;
const MONTH_COUNT = 10;
const DAYS_IN_DECADE = 10;
const INTERIM_INDEX = 5;

function is_leap_year_uc(year: number): boolean
{
	return (year % 4 === 0) && (year % 128 !== 0);
}

function get_ordinal(n: number): string
{
	const suffix = (n % 10 === 1 && n % 100 !== 11) ? "st" :
	               (n % 10 === 2 && n % 100 !== 12) ? "nd" :
	               (n % 10 === 3 && n % 100 !== 13) ? "rd" : "th";
	return `${n}${suffix}`;
}

function format_time_component(n: number): string
{
	return n.toString().padStart(2, '0');
}

type uc_date_t = {
	notation: string,

	era: era_t,

	year: number,
	month: month_t | null,
	day: number | null,

	decade_day: decade_day_t | null,

	hour: number | null,
	minute: number | null,
	second: number | null,
};

function get_current_uc_date(): uc_date_t
{
	const now = new Date();

	const today_midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	const epoch_year = 1945;
	const epoch_month = 0; // January
	const epoch_day = 1;

	const epoch_midnight = new Date(epoch_year, epoch_month, epoch_day);

	const diff_ms = today_midnight.getTime() - epoch_midnight.getTime();
	const diff_days = Math.floor(diff_ms / (1000 * 60 * 60 * 24));

	let day_counter = diff_days;
	let year = 1;

	while (true)
	{
		const is_leap = is_leap_year_uc(year);
		const year_days = is_leap ? 366 : 365;

		if (day_counter < year_days)
		{
			break;
		}

		day_counter -= year_days;
		year++;
	}

	const is_leap = is_leap_year_uc(year);

	const month_lengths: number[] = [];

	for (let i = 0; i < MONTH_COUNT; i++)
	{
		month_lengths.push(i % 2 === 0 ? DAYS_IN_SHORT_MONTH : DAYS_IN_LONG_MONTH);
	}

	let interim_day_position = 0;
	for (let i = 0; i < INTERIM_INDEX; i++)
	{
		interim_day_position += month_lengths[i];
	}

	const hours = now.getHours();
	const minutes = now.getMinutes();
	const seconds = now.getSeconds();

	if (is_leap && day_counter === interim_day_position)
	{
		return {
			notation: `UC ${year}.Interim NME`,

			era: era_t.NME,
			year: year,

			month: null,
			day: null,
			decade_day: null,

			hour: hours,
			minute: minutes,
			second: seconds
		};
	}

	let adjusted_day_counter = day_counter;
	if (is_leap && day_counter > interim_day_position)
	{
		adjusted_day_counter -= 1;
	}

	let month = month_t.March;
	while (month < MONTH_COUNT && adjusted_day_counter >= month_lengths[month])
	{
		adjusted_day_counter -= month_lengths[month];
		month++;
	}

	const day = adjusted_day_counter + 1;

	let day_of_year = 0;
	for (let i = 0; i < month; i++)
	{
		day_of_year += month_lengths[i];
	}
	day_of_year += adjusted_day_counter;

	if (is_leap && day_counter > interim_day_position)
	{
		day_of_year += 1;
	}

	const decade_day_index = day_of_year % DAYS_IN_DECADE;

	return {
		notation: `UC ${year}.${(month + 1).toString().padStart(2, '0')}.${day.toString().padStart(2, '0')} NME`,

		era: era_t.NME,
		year: year,

		month: month,
		day: day,
		decade_day: decade_day_index,

		hour: hours,
		minute: minutes,
		second: seconds
	}
}

function update_uc_display(): void
{
	const notation = document.getElementById("uc-date-notation");
	const year = document.getElementById("uc-date-year");
	const time = document.getElementById("uc-date-time");
	const day = document.getElementById("uc-date-day");

	if (notation && year && time && day)
	{
		const date = get_current_uc_date();

		notation.innerHTML = date.notation;

		year.innerHTML = `${date.year} ${era_to_string(date.era, false)}`;

		time.innerHTML =
			`${format_time_component(date.hour ?? 0)}:` +
			`${format_time_component(date.minute ?? 0)}:` +
			`${format_time_component(date.second ?? 0)}`;

		day.innerHTML = `${get_ordinal(date.day ?? 0)} of ${month_to_string(date.month ?? 0)}, ${day_to_string(date.decade_day ?? 0)}`;

	}
}

window.addEventListener("DOMContentLoaded", () =>
{
	fetch("INFO.html")
		.then(res => res.text())
		.then(html => {
			const info = document.getElementById("uc-info");
			if (info)
			{

				info.innerHTML = html;
			} 
		});

	update_uc_display();
	
	setInterval(() => {
		update_uc_display();
	}, 1000);
});
