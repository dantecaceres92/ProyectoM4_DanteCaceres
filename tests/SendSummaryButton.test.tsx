import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SendSummaryButton } from '../src/components/SendSummaryButton';
import { sendTasksSummary } from '../src/api/emailApi';

vi.mock('../src/api/emailApi');
const mockedSend = vi.mocked(sendTasksSummary);

describe('<SendSummaryButton />', () => {
  it('muestra éxito cuando la función serverless responde OK', async () => {
    mockedSend.mockResolvedValue({ message: 'ok', sentTo: 'dante@mail.com' });
    render(<SendSummaryButton tasks={[]} />);

    await userEvent.click(screen.getByRole('button'));
    expect(await screen.findByText(/Resumen enviado a dante@mail.com/)).toBeInTheDocument();
  });

  it('muestra el error cuando falla el envío', async () => {
    mockedSend.mockRejectedValue(new Error('No se pudo enviar el email'));
    render(<SendSummaryButton tasks={[]} />);

    await userEvent.click(screen.getByRole('button'));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo enviar el email');
  });
});
