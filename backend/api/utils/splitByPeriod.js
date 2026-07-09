export const splitByPeriod = (items) => {
  const lt3 = [];
  const warning = [];
  const gt3 = [];

  items.forEach((it) => {
    const days = Number(it.UMUR_ORDER ?? 0);

    if (!Number.isFinite(days)) {
      gt3.push({ ...it, isWarning: false });
      return;
    }

    if (days > 60) {
      gt3.push({ ...it, isWarning: false, isOver90: true });
    } else {
      const isWarn = days >= 20;
      lt3.push({ ...it, isWarning: isWarn, isOver90: false });

      if (isWarn) {
        warning.push({ ...it, isWarning: true, isOver90: false });
      }
    }
  });

  return {
    "<3blnItems": lt3,
    warningItems: warning,
    ">3blnItems": gt3,
    "<3blnCount": lt3.length,
    warningCount: warning.length,
    ">3blnCount": gt3.length,
  };
};
