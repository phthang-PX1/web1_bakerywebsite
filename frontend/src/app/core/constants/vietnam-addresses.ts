export interface CityDistricts {
  readonly city: string;
  readonly districts: readonly string[];
}

export const VIETNAM_CITY_DISTRICTS: readonly CityDistricts[] = [
  {
    city: 'TP. Hồ Chí Minh',
    districts: [
      'Quận 1',
      'Quận 3',
      'Quận 4',
      'Quận 5',
      'Quận 6',
      'Quận 7',
      'Quận 8',
      'Quận 10',
      'Quận 11',
      'Quận 12',
      'Bình Thạnh',
      'Gò Vấp',
      'Phú Nhuận',
      'Tân Bình',
      'Tân Phú',
      'Bình Tân',
      'Thủ Đức',
      'Bình Chánh',
      'Cần Giờ',
      'Củ Chi',
      'Hóc Môn',
      'Nhà Bè',
    ],
  },
  {
    city: 'Hà Nội',
    districts: [
      'Ba Đình',
      'Hoàn Kiếm',
      'Tây Hồ',
      'Long Biên',
      'Cầu Giấy',
      'Đống Đa',
      'Hai Bà Trưng',
      'Hoàng Mai',
      'Thanh Xuân',
      'Nam Từ Liêm',
      'Bắc Từ Liêm',
      'Hà Đông',
      'Sơn Tây',
      'Ba Vì',
      'Chương Mỹ',
      'Đan Phượng',
      'Đông Anh',
      'Gia Lâm',
      'Hoài Đức',
      'Mê Linh',
      'Mỹ Đức',
      'Phú Xuyên',
      'Phúc Thọ',
      'Quốc Oai',
      'Sóc Sơn',
      'Thạch Thất',
      'Thanh Oai',
      'Thanh Trì',
      'Thường Tín',
      'Ứng Hòa',
    ],
  },
  {
    city: 'Đà Nẵng',
    districts: ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ', 'Hòa Vang', 'Hoàng Sa'],
  },
  {
    city: 'Cần Thơ',
    districts: ['Ninh Kiều', 'Bình Thủy', 'Cái Răng', 'Ô Môn', 'Thốt Nốt', 'Phong Điền', 'Cờ Đỏ', 'Thới Lai', 'Vĩnh Thạnh'],
  },
  {
    city: 'Bình Dương',
    districts: ['Thủ Dầu Một', 'Dĩ An', 'Thuận An', 'Tân Uyên', 'Bến Cát', 'Bàu Bàng', 'Bắc Tân Uyên', 'Dầu Tiếng', 'Phú Giáo'],
  },
  {
    city: 'Đồng Nai',
    districts: ['Biên Hòa', 'Long Khánh', 'Long Thành', 'Nhơn Trạch', 'Trảng Bom', 'Thống Nhất', 'Vĩnh Cửu', 'Xuân Lộc', 'Cẩm Mỹ', 'Định Quán', 'Tân Phú'],
  },
  {
    city: 'Khác',
    districts: ['Khác'],
  },
];

export const ADDRESS_CITIES = VIETNAM_CITY_DISTRICTS.map((item) => item.city);

export const getDistrictsByCity = (city: string | null | undefined): readonly string[] =>
  VIETNAM_CITY_DISTRICTS.find((item) => item.city === city)?.districts ?? [];
