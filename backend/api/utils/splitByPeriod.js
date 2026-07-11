export const splitByPeriod = (items) => {
  const lt2 = [];
  const warning = [];
  const gt2 = [];

  items.forEach((it) => {
    const days = Number(it.UMUR_ORDER ?? 0);

    if (!Number.isFinite(days)) {
      gt2.push({ ...it, isWarning: false });
      return;
    }

    if (days > 60) {
      gt2.push({ ...it, isWarning: false, isOver90: true });
    } else {
      const isWarn = days >= 20;
      lt2.push({ ...it, isWarning: isWarn, isOver90: false });

      if (isWarn) {
        warning.push({ ...it, isWarning: true, isOver90: false });
      }
    }
  });

  // console.log("lt2:", lt2);

  return {
    "<2blnItems": lt2,
    warningItems: warning,
    ">2blnItems": gt2,
    "<2blnCount": lt2.length,
    warningCount: warning.length,
    ">2blnCount": gt2.length,
  };
};
