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
}

const HairstyleSelector: React.FC<HairstyleSelectorProps> = ({
	bookId,
	selectedHairstyle,
	onChange,
	onBlur,
	error,
	touched,
}) => {
	// 根据bookId动态生成发型选项
	const hairstyles = [
		{ id: 'hair_1', name: '发型 1', image: `/picbooks/${bookId}/avatar/layer_hair_1.png` },
		{ id: 'hair_2', name: '发型 2', image: `/picbooks/${bookId}/avatar/layer_hair_2.png` },
		{ id: 'hair_3', name: '发型 3', image: `/picbooks/${bookId}/avatar/layer_hair_3.png` },
		{ id: 'hair_4', name: '发型 4', image: `/picbooks/${bookId}/avatar/layer_hair_4.png` },
	];

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
									title={hairstyle.name}
									aria-pressed={isActive}
								>
									<Image
										src={hairstyle.image}
										alt={hairstyle.name}
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