enum GenderPermission {
  ALL,
  MALE_ONLY,
  FEMALE_ONLY,
}

const labels = [
  {
    kor: "남녀모두 투표가능"
  },
  {
    kor: "남자만 투표가능"
  },
  {
    kor: "여자만 투표가능"
  },
];

export function getPermissionValue(opt: GenderPermission) {
  switch (opt) {
    case GenderPermission.ALL:
      return "All";
    case GenderPermission.FEMALE_ONLY:
      return "Female";
    case GenderPermission.MALE_ONLY:
      return "Male";
  }
  return "Unknown";
}

export function getPermissionLabel(permission: GenderPermission, lang: string = 'kor') {
  if (permission > GenderPermission.FEMALE_ONLY)
    permission = GenderPermission.FEMALE_ONLY + 1;
  return labels[permission][lang];
}

export function getPermissionLables(lang: string = 'kor') {
  return labels.map(obj => obj[lang]);
}

export default GenderPermission;