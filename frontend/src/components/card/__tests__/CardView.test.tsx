import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { CardView } from '../../CardView';
import { getCardData } from '../../../data/cards';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props} data-testid="motion-div">{children}</div>
    }
}));

test('CardView mounts with motion animation props', () => {
    const cardData = getCardData('JK-001-YUJI');
    if (!cardData) throw new Error('Card data not found');

    const { getByTestId } = render(
        <CardView
            card={cardData}
            instance={{
                cardInstanceId: 'tmp',
                cardId: 'JK-001-YUJI',
                ownerId: 'p1',
                location: 'HAND' as any
            }}
            scale={1}
        />
    );

    const motionDiv = getByTestId('motion-div');
    expect(motionDiv).toBeInTheDocument();
    // Check for animation props passed to the mock
    expect(motionDiv).toHaveAttribute('initial');
    expect(motionDiv).toHaveAttribute('animate');
});
