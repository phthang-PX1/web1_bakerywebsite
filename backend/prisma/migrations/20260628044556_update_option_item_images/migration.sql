-- Update image URLs for option items that were missing images

-- Nhân bánh: Kem phô mai
UPDATE option_items SET image_url = 'https://res.cloudinary.com/dhw56qppe/image/upload/v1782492941/product-image/options-tuychon/mut-nhan/nhan-phomai.png'
WHERE name = 'Kem phô mai' AND group_id IN (SELECT group_id FROM option_groups WHERE name = 'Nhân bánh');

-- Kem phủ: Kem tươi (hồng)
UPDATE option_items SET image_url = 'https://res.cloudinary.com/dhw56qppe/image/upload/v1782492932/product-image/options-tuychon/kem-phu/kemphu-dau.png'
WHERE name = 'Kem tươi (hồng)';

-- Kem phủ: Kem phô mai
UPDATE option_items SET image_url = 'https://res.cloudinary.com/dhw56qppe/image/upload/v1782492934/product-image/options-tuychon/kem-phu/kemphu-phomai.png'
WHERE name = 'Kem phô mai' AND group_id IN (SELECT group_id FROM option_groups WHERE name = 'Kem phủ');

-- Kem phủ: Kem bơ
UPDATE option_items SET image_url = 'https://res.cloudinary.com/dhw56qppe/image/upload/v1782492931/product-image/options-tuychon/kem-phu/kemphu-bo.png'
WHERE name = 'Kem bơ';

-- Kem phủ: Ganache socola
UPDATE option_items SET image_url = 'https://res.cloudinary.com/dhw56qppe/image/upload/v1782492935/product-image/options-tuychon/kem-phu/kemphu-socola.png'
WHERE name = 'Ganache socola';

-- Topping: Dâu tươi
UPDATE option_items SET image_url = 'https://res.cloudinary.com/dhw56qppe/image/upload/v1782492946/product-image/options-tuychon/topping/topping-dau%282%29.png'
WHERE name = 'Dâu tươi';

-- Topping: Bánh quy
UPDATE option_items SET image_url = 'https://res.cloudinary.com/dhw56qppe/image/upload/v1782492945/product-image/options-tuychon/topping/topping-cookies.png'
WHERE name = 'Bánh quy';

-- Topping: whipping cream
UPDATE option_items SET image_url = 'https://res.cloudinary.com/dhw56qppe/image/upload/v1782492949/product-image/options-tuychon/topping/topping-kem.png'
WHERE name = 'whipping cream';

-- Topping: Cam tươi
UPDATE option_items SET image_url = 'https://res.cloudinary.com/dhw56qppe/image/upload/v1782492943/product-image/options-tuychon/topping/topping-cam.png'
WHERE name = 'Cam tươi';
