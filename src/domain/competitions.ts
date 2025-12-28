export function fdCompetitionName(id?: string): string | undefined {
  switch (String(id || "")) {
    case "2001":
      return "Champions League";
    case "2002":
      return "Bundesliga";
    case "2014":
      return "La Liga";
    case "2015":
      return "Ligue 1";
    case "2019":
      return "Serie A";
    case "2021":
      return "Premier League";
    default:
      return id ? `Competizione ${id}` : undefined;
  }
}
