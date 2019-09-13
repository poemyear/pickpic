enum GenderPermission {
  ALL,
  MALE_ONLY,
  FEMALE_ONLY,
}
enum GenderPermissionStr {
  ALL = "All",
  MALE_ONLY = "Male",
  FEMALE_ONLY = "Female",
  UNKNOWN = "Unknwon",
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
      return GenderPermissionStr.ALL;
    case GenderPermission.FEMALE_ONLY:
      return GenderPermissionStr.FEMALE_ONLY;
    case GenderPermission.MALE_ONLY:
      return GenderPermissionStr.MALE_ONLY;
  }
  return GenderPermissionStr.UNKNOWN;
}

export function getPermissionLabel(permission: GenderPermission, lang: string = 'kor') {
  console.log(permission, lang);
  if (permission > GenderPermission.FEMALE_ONLY || permission < 0)
    return "";
  return labels[permission][lang];
}

export function getPermissionLabelByValue(value: string, lang: string = 'kor') {
  let permission: GenderPermission = -1;
  switch (value) {
    case GenderPermissionStr.ALL:
      permission = GenderPermission.ALL;
      break;
    case GenderPermissionStr.FEMALE_ONLY:
      permission = GenderPermission.FEMALE_ONLY;
      break;
    case GenderPermissionStr.MALE_ONLY:
      permission = GenderPermission.MALE_ONLY;
      break;
  }

  return getPermissionLabel(permission, lang);
}


export function getPermissionLables(lang: string = 'kor') {
  return labels.map(obj => obj[lang]);
}

export default GenderPermission;