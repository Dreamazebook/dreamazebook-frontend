/** @jsxImportSource react */
'use client';

import React from 'react';
import Image from 'next/image';

interface HairstyleSelectorProps {
	bookId: string;
	selectedHairstyle: string;
	onChange: (hairstyle: string) => void;
	onBlur?: () => void;
	error?: string;
	touched?: boolean;
  // Optional: backend-driven hair style values, e.g. ["1","2","3","4"].
  // UI remains the same; values are mapped to internal ids: hair_1..hair_4
  hairStyleValues?: string[];
}

const HairstyleSelector: React.FC<HairstyleSelectorProps> = ({
	bookId,
	selectedHairstyle,
	onChange,
	onBlur,
	error,
	touched,
  hairStyleValues,
}) => {
	// 根据bookId动态生成发型选项，支持后端传值（数量与顺序跟随后端）
	const ids = (hairStyleValues && hairStyleValues.length > 0)
		? hairStyleValues.map(v => `hair_${v}`)
		: ['hair_1','hair_2','hair_3','hair_4'];

	const hairstyles = ids.map(id => ({ id, image: `/products/picbooks/${bookId}/avatar/layer_${id}.png` }));

	const handleHairstyleSelect = (hairstyleId: string) => {
		onChange(hairstyleId);
	};

	return (
		<div>
			<div className="flex items-center justify-between" tabIndex={0} onBlur={onBlur}>
				<label className="font-medium">Hairstyle</label>
				<div className="flex gap-[10px]">
					{hairstyles.map((hairstyle) => {
						const isActive = selectedHairstyle === hairstyle.id;
						return (
							<div
								key={hairstyle.id}
								className={`w-16 h-16 rounded-[35px] p-1 flex items-center justify-center border ${
									isActive ? 'bg-[#FCF2F2] border-[#012CCE]' : 'bg-[#F8F8F8] border-transparent'
								}`}
							>
								<button
									type="button"
									className={`relative w-14 h-14 rounded-full overflow-hidden ${
										isActive ? 'bg-white' : ''
									}`}
									style={{ boxShadow: '9px 31px 64px 0px #A6ABE114' }}
									onClick={() => handleHairstyleSelect(hairstyle.id)}
									aria-pressed={isActive}
								>
									<Image
										src={hairstyle.image}
										alt={hairstyle.id}
										fill
										sizes="56px"
										className="object-cover"
										style={{ 
											filter: 'grayscale(100%)',
											opacity: 0.5,
											transform: 'scale(1.2)'
										}}
										onError={(e) => {
											// 如果图片加载失败，显示占位符
											const target = e.target as HTMLImageElement;
											target.style.display = 'none';
										}}
									/>
								</button>
							</div>
						);
					})}
				</div>
			</div>
			{touched && error && (
				<p className="text-red-500 text-sm mt-1">{error}</p>
			)}
		</div>
	);
};

export default HairstyleSelector;