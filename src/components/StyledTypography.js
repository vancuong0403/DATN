import styled from '@emotion/styled';
import React, { useEffect, useRef, useState } from 'react';

const StyledTypography = styled.p`
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  ${({ variant }) => {
        switch (variant) {
            case 'h1':
                return `
        font-size: 72px; 
        line-height: 90px;
        `;
            case 'h2':
                return `
        font-size: 60px; 
        line-height: 72px;
        `;
            case 'h3':
                return `
        font-size: 48px; 
        line-height: 60px;
        `;
            case 'h4':
                return `
        font-size: 36px; 
        line-height: 44px;
        `;
            case 'h5':
                return `
        font-size: 30px; 
        line-height: 38px;
        `;
            case 'h6':
                return `
        font-size: 24px; 
        line-height: 32px;
        `;
            case 'subtitle1':
                return `
        font-size: 20px; 
        line-height: 30px;
        `;
            case 'subtitle2':
                return `
        font-size: 18px; 
        line-height: 28px;
        `;
            case 'body1':
                return `
        font-size: 16px; 
        line-height: 24px;
        `;

            case 'body2':
                return `
        font-size: 14px; 
        line-height: 18px;
        `;
            case 'caption':
                return `
        font-size: 10px; 
        line-height: 16px;
        `;

            default:
                return '';
        }
    }}

  ${({ fontWeight }) => (fontWeight ? `font-weight: ${fontWeight};` : '')}
  ${({ color }) => (color ? `color: ${color};` : '')}
  ${({ fontSize }) => (fontSize ? `font-size: ${fontSize};` : '')}
`;

const StyledTypographyContent = styled.div`
  white-space: pre-wrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  max-height: 100px;
  min-height: 100px;
  -webkit-line-clamp: 5; /* Số dòng tối đa hiển thị */
  -webkit-box-orient: vertical;
`;

const StyledTypographyContentHeight = styled.div`
  white-space: pre-wrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  max-height: 60px;
  min-height: 60px;
  -webkit-line-clamp: 5; /* Số dòng tối đa hiển thị */
  -webkit-box-orient: vertical;
`;

const Typography = ({ variant = 'body1', isContent = false, rowCount = 5, x_bIsMaxHeightHeight = false, children, ...rest }) => {
    const typographyRef = useRef(null);

    useEffect(() => {
        if (typographyRef.current) {
            const { scrollHeight, clientHeight } = typographyRef.current;
        }
    }, [children]);

    return (
        <div>
            {
                isContent && x_bIsMaxHeightHeight === false?
                    <StyledTypographyContent ref={typographyRef} style={{WebkitLineClamp: rowCount}}>
                        {children}
                    </StyledTypographyContent>
                    :
                    isContent && x_bIsMaxHeightHeight?
                    <StyledTypographyContentHeight ref={typographyRef} style={{WebkitLineClamp: rowCount}}>
                        {children}
                    </StyledTypographyContentHeight>
                    :
                    <StyledTypography variant={variant} {...rest}>
                        {children}
                    </StyledTypography>
            }
        </div>
    );
};

export { Typography };
